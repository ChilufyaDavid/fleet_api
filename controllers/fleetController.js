const { convertDateFormat, mySqlDateFormat,timeToSeconds, secondsToTime, getWeekNumber,compareDateStrings} = require('../utils/dateUtils')
const { addTrip,addParking,addDrivesSummary, addBatch, addGeofence, updateParking } = require('../services/fleetService')
const { fetchExternalData } = require('../services/bgsService')
const dbConn = require('../config/db.config');
const {  fetchDataFromExternalAPI,fetchDataFromExternalAPIGeofence } = require('../api/bgsAPI');
const { isPointInPolygon } = require('../utils/geofenceUtil');

let batchStatus = { //confirms which batches have pulled trips
    'isActive': false, // true active, false inactive, becomes active when we get batches
    'completionStatus' : 'complete', //active becomes incomplete,
    'completedBatches' : {}, //just add batch name for each batch
    'batchLength': 0, //total batches
    'batches':[]
};

function getUnits(){ //get units and post to batches
    dbConn.query('SELECT * FROM units', function(error, units){
        if(error){
            //send back error
            console.log("There was an error getting units")
            console.log(error)
            //return [];
        }else{ 
            arrangeUnitBatch(units)
        }})
    
}

async function getUnitBatches(token) { //gets units in batches and stores in global variable for querying trips
     dbConn.query('SELECT * FROM unit_batches', async function(error, batches){
        if(error){
            //send back error
            console.log("There was an error getting units")
            console.log(error)
            //return [];
        }else{ 
            batchStatus.isActive = true;
            batchStatus.completionStatus = 'incomplete',
            batchStatus.batchLength = batches.length,
            batchStatus.batches = []
            getTrips(token, batches)
        }});
}

async function getTrips(token, batches){ //gets drives, posts drives by unit id
    //let count = 0;
    for(const index in batches){//for every unit, fetch external data
        const response = await fetchDataFromExternalAPI(token, JSON.parse(batches[index].batches), {from: "2023-06-01", to: "2023-06-01" }); 
        if(response['data']['unitId'] != 0){
            count ++
            console.log('Local Unit : ');
            console.log(batches[index].batch_name)
            console.log('Remote Unit : ');
            //console.log(response['data']);
            console.log('Total drives : ');
            console.log(response['data']['totalDrives']);
            console.log(count)
            //postTrips(response['data'])
        }else{
            console.log("hasnt posted")
            console.log(response['data']['unitId'])
            console.log(response['data']['unitId'].length)
        }
    }
    //post to daily trips - id, unit_trips-all, unit_trips_today, date, date_posted
    //dbConn.end();
}

async function postTrips(unit) {
    const insertQuery = `
        INSERT INTO trips (unit_id, average_speed, max_speed,device_IMEI,odometer,name,unit_mileage, total_drives, drives)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`;
    dbConn.query(insertQuery, 
    [unit.unitId, unit.averageSpeed, unit.maxSpeed, unit.deviceIMEI, unit.odometer, unit.name, unit.unitMileage,unit.totalDrives,JSON.stringify(unit.drives)],function(err,result) {
        if(err) {
           console.log('Error inserting trips');
           console.log(err)
        }
       else {
        console.log('Trips inserted');
        }
      })
    //dbConn.end();  
}

async function processTrips(date) {
    dbConn.query('SELECT * FROM trips', async function(error, trips){
        if(error){
            //send back error
            console.log("There was an error")
            console.log(error)
            //return [];
        }else{ 
            
            for(const index in trips){
                var drives = filterTripsByDate(JSON.parse(trips[index].drives), date); //trips for a day
                if(drives.length > 0 ){

                    addParking({
                        'unit_id': trips[index].unit_id,
                        'name' : trips[index].name,
                        'end_time': drives[drives.length-1].tripEndTime.split(' ')[1],
                        'start_date':  date, //mySqlDateFormat(date),
                        'end_date':  date, //mySqlDateFormat(drives[drives.length-1].tripEndTime.split(' ')[0]),
                        'on_time_status': drives[drives.length-1].tripEndTime.split(' ')[1] > "18:30",
                        'location_status': "Undesignated",
                        'location': drives[drives.length-1].finalLocation,
                        'end_coordinates': drives[drives.length-1].finalCoordinates,
                        'week': getWeekNumber(new Date(date)),
                        'month': new Date(date).getMonth()+1
                    });

                    var drivesDuration = [];

                    for(const drive_index in drives){
                       // -- console.log(`Date : ${drives[index].tripStartTime}`)
                       if(drives[drive_index].tripStartTime.split(' ')[1] > "08:00" && drives[drive_index].tripEndTime.split(' ')[1] < "18:30:00"){
                            drivesDuration.push(drives[drive_index].tripDuration);
                       }
                       //console.log(trips[index])
                        addTrip({
                            'unit_id': trips[index].unit_id,
                            'name': trips[index].name,
                            'start_time' : drives[drive_index].tripStartTime.split(' ')[1],//drives[index],
                            'end_time': drives[drive_index].tripEndTime.split(' ')[1],
                            'start_date':mySqlDateFormat(drives[drive_index].tripStartTime.split(' ')[0]) ,
                            'end_date':mySqlDateFormat(drives[drive_index].tripEndTime.split(' ')[0]),
                            'start_location': drives[drive_index].initialLocation,
                            'end_location':drives[drive_index].finalLocation,
                            'start_coordinates':drives[drive_index].initialCoordinates,
                            'end_coordinates': drives[drive_index].finalCoordinates,
                            'trip_duration' : drives[drive_index].tripDuration,
                            'trip_off_time' : drives[drive_index].tripOffTime,
                            'average_speed' : drives[drive_index].averageSpeed.replace(/[^\d]/g, ""),
                            'mileage' : drives[drive_index].mileage.replace(/[^\d]/g, ""),
                            'initial_mileage': drives[drive_index].initialMileage.replace(/[^\d]/g, ""),
                            'final_mileage': drives[drive_index].finalMileage.replace(/[^\d]/g, ""),
                            'max_speed': drives[drive_index].maxSpeed.replace(/[^\d]/g, ""),
                            'week': getWeekNumber(new Date(mySqlDateFormat(drives[drive_index].tripStartTime.split(' ')[0]))),
                            'month': new Date(mySqlDateFormat(drives[drive_index].tripStartTime.split(' ')[0])).getMonth()+1
                        });
                        
                    }

                    const totalSeconds = drivesDuration.reduce((total, duration) => total + timeToSeconds(duration), 0);
                    var drivesSummary = {
                        'unit_id': trips[index].unit_id,
                        'drives' : drives.length,
                        'day_drives': drivesDuration.length,
                        'drives_duration': secondsToTime(totalSeconds),
                        'off_time': isFinite(((totalSeconds/timeToSeconds("9:30:00")) * 100).toFixed(2)) ? ((totalSeconds/timeToSeconds("9:30:00")) * 100).toFixed(2) : 0,//show percentage
                        'date': date,
                        'name' : trips[index].name,
                        'week': getWeekNumber(new Date(date)),
                        'month': new Date(mySqlDateFormat(date)).getMonth()+1
            
                    }
                    addDrivesSummary(drivesSummary); //vehicle util

                }else{
                    console.log("No drives for : ")
                    console.log(date)
                }
            }
        }               
    });
   // dbConn.end();
}

function filterOverSpeeding(trips){
    let overspeeding = [];
    for(index in trips){
        if(trips[index].average_speed > 70){
            overspeeding.push(trips[index])
        }
    }

    return overspeeding;
}

function filterTripsByDate(trips, filterDate){
    if(trips !== null){
        const filteredTrips = trips.filter((trip) => {
           // console.log(`Dates : ${convertDateFormat(trip.tripStartTime)}- ${filterDate} ${compareDateStrings(filterDate,convertDateFormat(trip.tripStartTime))}`)
          //const tripDate = convertDateTimeFormat(trip.tripStartTime);
          //--console.log(`Converted Date : ${trip.tripStartTime}, ${new Date(convertDateFormat(trip.tripStartTime)).getDate()} ${new Date(convertDateFormat(trip.tripStartTime)).getDate() === new Date(filterDate).getDate()}`)
          return (compareDateStrings(filterDate,convertDateFormat(trip.tripStartTime)) )
        });
        //console.log(filteredTrips)
        //---console.log(`Filtered date called return : ${filteredTrips}`)
        return filteredTrips
    }else{
        return []
    }
    
}



function arrangeUnitBatch(units) { //to be used once
    let batch_count = 0; //number of batches
    let count = 0; ///reset every 5 or less
    let batch = {
        'batch_name' : '',
        'batches': []
    }
  
    for(const index in units){
        count++;
        batch.batches.push({'unitId':parseInt(units[index]['item_id'])});
        if(count >= 5){
            
            batch_count ++;
            batch.batch_name = `_${batch_count}`;
            addBatch(batch);
            batch.batches = [];
            count = 0;
        }else if((units.length - (batch_count * 5)) <= count){
            batch_count ++;
            batch.batch_name = `_${batch_count}`;
            addBatch(batch);
            batch.batches = [];
            count = 0;
        }
    }
}

// util functions

async function getGeofencesFromAPI(token){ //get from external Api and post geofences
    const gID = [{'geofenceId': 33},{'geofenceId': 34},{'geofenceId': 35},{'geofenceId': 36}];
    const response = await fetchDataFromExternalAPIGeofence(token, gID); 
    let polygon;
    //console.log(response)
    for(const index in response){
        let polygonPoints = [];
        for(const i in response[index].geofencePoints){
            polygonPoints.push([response[index].geofencePoints[i].latitude,response[index].geofencePoints[i].longitude])
        }
        
        polygon = {
            'name': response[index].geofenceName,
            'description': response[index].geofenceDescription,
            'points' :  polygonPoints
        };
        console.log(polygon)
        addGeofence(polygon)
        polygonPoints = []
    }
}


async function checkTripsInGeofences(){ //test function

    dbConn.query('SELECT * FROM geofences', async function(error, gf){
        if(error){
            //send back error
            console.log("There was an error")
            console.log(error)
            //return [];
        }else{ 
            //console.log(gf)
            dbConn.query('SELECT * FROM parking', async function(error, parkings){
                if(error){
                    //send back error
                    console.log("There was an error")
                    console.log(error)
                    //return [];
                }else{ 
                    
                    for(const index in parkings){ 
                        console.log(isPointInPolygon(parkings[index].end_coordinates, gf))
                        if(isPointInPolygon(parkings[index].end_coordinates, gf )!== false){ //update parking
                            //console.log(parkings[index].end_coordinates)
                            //console.log(parkings[index].end_location)
                            //console.log("Finally");
                            //return
                            updateParking(parkings[index].id, isPointInPolygon(parkings[index].end_coordinates, gf));

                        }
                    }
        
                }});

        }});

    

    
}

function updateData() { //used this for manual quick updates
    //pull from units
    dbConn.query('SELECT * FROM units', function(error, result){
        if(error){
            //send back error
            console.log("There was an error")
            console.log(error)
            return ;
        }else{
            //send back success
            //console.log(`Hurray ${result}`)
            for(const i in result){
                postDataUpdate(result[i].name,result[i].item_id )
            }
           //console.log(`units ${JSON.stringify(result)}`)
          return 
        }
    });
    
}   

function postDataUpdate(name, registration) {
        //console.log(`INSERT DATA ${data}`)
        const updateQuery = 'UPDATE drives SET name = ? WHERE unit_id = ?';
        dbConn.query(updateQuery, [name, registration], function(error, result){
            if(error){
                //send back error
                console.log(`Error inserting batch ${error}`)
            }else{
                //send back success
                console.log(result.affectedRows)
            }
        });
}

function manuallyAddDrives(date) {
    dbConn.query('SELECT * FROM trips', async function(error, trips){
        if(error){
            //send back error
            console.log("There was an error")
            console.log(error)
            //return [];
        }else{ 
            
            for(const index in trips){
                //console.log(trips[index].drives)
                if(trips[index].drives !== null){
                    if(trips[index].drives.length > 0){
                        var drives = filterTripsByDate(JSON.parse(trips[index].drives), date);
                    
                        if(drives.length > 0 ){ 
                            console.log(`${drives.length} for ${date}`)
                        }else{
                            console.log(`No drives for ${date}`)
                        }
                    }else{
                        console.log(`No drives`)
                    }
                }else{
                    console.log(`Is NULL`)
                }
                
                
             } 
        }})
}


module.exports = {
    processTrips,
    filterOverSpeeding,
    getUnits,
    getUnitBatches,
    updateData,
    checkTripsInGeofences,
    manuallyAddDrives
}