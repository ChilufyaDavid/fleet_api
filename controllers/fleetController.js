const { convertDateFormat, mySqlDateFormat,timeToSeconds, secondsToTime, getWeekNumber,compareDateStrings} = require('../utils/dateUtils')
const { addTrip,addParking,addDrivesSummary, addBatch, addGeofence, updateParking, updateFleetStatus, updateFleetCoord } = require('../services/fleetService')
const { fetchExternalData } = require('../services/bgsService')
const dbConn = require('../config/db.config');
const {  fetchDataFromExternalAPI,fetchDataFromExternalAPIGeofence } = require('../api/bgsAPI');
const { isPointInPolygon } = require('../utils/geofenceUtil');


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
          
          return (compareDateStrings(filterDate,convertDateFormat(trip.tripStartTime)) )
        });
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
async function getGeofencesFromAPI(token){ //get from external Api and post geofences // this is for when you update the geofence coordinates
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

function processFleetStatus(data) {
    for(const i in data){
        console.log("Updating Data:")
        updateFleetStatus(data[i])
    }
}

async function processCoord(data) {
    for(const i in data){
        console.log("Updating Data:")
        const parts = data[i].end_coordinates.split(', ');
        await updateFleetCoord({
            'latitude': parts[0],
            'longitude': parts[1],
            'id' : data[i].id,
            })
    }
}


module.exports = {
    filterOverSpeeding,
    getUnits,
    updateData,
    checkTripsInGeofences,
    manuallyAddDrives,
    processFleetStatus,
    processCoord
}