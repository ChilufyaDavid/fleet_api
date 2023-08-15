const { convertDateFormat, mySqlDateFormat,timeToSeconds, secondsToTime, getWeekNumber} = require('../utils/dateUtils')
const { addTrip,addParking,addDrivesSummary } = require('../services/fleetService')
const { fetchExternalData } = require('../services/bgsService')
const dbConn = require('../config/db.config');
const {  fetchDataFromExternalAPI } = require('../api/bgsAPI');

async function processTrips(token, date) {

    dbConn.query('SELECT * FROM units', async function(error, unit){
        if(error){
            //send back error
            console.log("There was an error")
            console.log(error)
            //return [];
        }else{
            
            console.log("Units fetched Success")
            for(const unit_index in unit){//for every unit, fetch external data
              
                fetchExternalData(unit[unit_index].item_id, token ,{'from':date, 'to': date}).
                    then((bgs_data) => {// this currently returns everything
                    //console.log(`Drives itemId : ${unit[unit_index].item_id}, Date : ${date} ${JSON.stringify(unit[unit_index])} `)
                    
                    var drives = filterTripsByDate(bgs_data.data, date);//returns trips for chosen date
                    if(drives.length > 0){
                        //var last_trip = drives[drives.length-1];
                        addParking({
                            'unit_id': unit[unit_index].item_id,
                            'end_time': drives[drives.length-1].tripEndTime.split(' ')[1],
                            'start_date':  date, //mySqlDateFormat(date),
                            'end_date':  date, //mySqlDateFormat(drives[drives.length-1].tripEndTime.split(' ')[0]),
                            'on_time_status': drives[drives.length-1].tripEndTime.split(' ')[1] > "18:30",
                            'location_status': 0,
                            'week': getWeekNumber(new Date(date)),
                            'month': new Date(date).getMonth()+1
                        });

                        var drivesDuration = [];

                        for(const index in drives){
                           // -- console.log(`Date : ${drives[index].tripStartTime}`)
                           if(drives[index].tripStartTime.split(' ')[1] > "08:00" && drives[index].tripEndTime.split(' ')[1] < "18:30:00"){
                                drivesDuration.push(drives[index].tripDuration);
                           }
                            
                           
                            addTrip({
                                'unit_id': unit[unit_index].item_id,
                                'start_time' : drives[index].tripStartTime.split(' ')[1],//drives[index],
                                'end_time': drives[index].tripEndTime.split(' ')[1],
                                'start_date':mySqlDateFormat(drives[index].tripStartTime.split(' ')[0]) ,
                                'end_date':mySqlDateFormat(drives[index].tripEndTime.split(' ')[0]),
                                'start_location': drives[index].initialLocation,
                                'end_location':drives[index].finalLocation,
                                'start_coordinates':drives[index].initialCoordinates,
                                'end_coordinates': drives[index].finalCoordinates,
                                'trip_duration' : drives[index].tripDuration,
                                'trip_off_time' : drives[index].tripOffTime,
                                'average_speed' : drives[index].averageSpeed.replace(/[^\d]/g, ""),
                                'mileage' : drives[index].mileage.replace(/[^\d]/g, ""),
                                'initial_mileage': drives[index].initialMileage.replace(/[^\d]/g, ""),
                                'final_mileage': drives[index].finalMileage.replace(/[^\d]/g, ""),
                                'max_speed': drives[index].maxSpeed.replace(/[^\d]/g, ""),
                                'week': getWeekNumber(new Date(mySqlDateFormat(drives[index].tripStartTime.split(' ')[0]))),
                                'month': new Date(mySqlDateFormat(drives[index].tripStartTime.split(' ')[0])).getMonth()+1

                            })
                        }

                        
                        const totalSeconds = drivesDuration.reduce((total, duration) => total + timeToSeconds(duration), 0);
                        //-- console.log(`Day trips: ${timeToSeconds("9:30:00")} ${totalSeconds} ${((totalSeconds/timeToSeconds("9:30:00")) * 100).toFixed(2)} ${isFinite(((totalSeconds/timeToSeconds("9:30:00")) * 100).toFixed(2))}`)

                        var drivesSummary = {
                            'unit_id': unit[unit_index].item_id,
                            'drives' : drives.length,
                            'day_drives': drivesDuration.length,
                            'drives_duration': secondsToTime(totalSeconds),
                            'off_time': isFinite(((totalSeconds/timeToSeconds("9:30:00")) * 100).toFixed(2)) ? ((totalSeconds/timeToSeconds("9:30:00")) * 100).toFixed(2) : 0,//show percentage
                            'date': date,
                            'week': getWeekNumber(new Date(date)),
                            'month': new Date(mySqlDateFormat(date)).getMonth()+1
                
                        }
                        addDrivesSummary(drivesSummary);

                    }
                }).catch((error) => {
                    console.log(`Cant fetch drives API ${error}`)
                }); //returns cleaned trips
            }
        }
    });
    
} 

function filterTripsByDate(trips, filterDate){
    console.log(`Filtered date called with trips : ${trips}`)
    const filteredTrips = trips.filter((trip) => {
      //const tripDate = convertDateTimeFormat(trip.tripStartTime);
      //--console.log(`Converted Date : ${trip.tripStartTime}, ${new Date(convertDateFormat(trip.tripStartTime)).getDate()} ${new Date(convertDateFormat(trip.tripStartTime)).getDate() === new Date(filterDate).getDate()}`)
      return (new Date(convertDateFormat(trip.tripStartTime)).getDate() === new Date(filterDate).getDate() )
    });
    //console.log(filteredTrips)
    //---console.log(`Filtered date called return : ${filteredTrips}`)
    return filteredTrips
  }

module.exports = {
    processTrips
}