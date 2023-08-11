const { convertDateFormat, mySqlDateFormat,timeToSeconds, secondsToTime} = require('../utils/dateUtils')
const { addTrip,addParking,addDrivesSummary } = require('../services/fleetService')
const { fetchExternalData } = require('../services/bgsService')
const dbConn = require('../config/db.config');
const {  fetchDataFromExternalAPI } = require('../api/bgsAPI');

async function processTrips(token, date) {
    dbConn.query('SELECT * FROM units', async function(error, result){
        if(error){
            //send back error
            console.log("There was an error")
            console.log(error)
            //return [];
        }else{
            
            console.log("Units fetched Success")
            for(const unit in result){
              
                fetchExternalData(result[unit].itemId, token ,{'from':date, 'to': date}).then((drives_result) => {
                    console.log(`Drives itemId : ${result[unit].itemId}, Date : ${date} }`)// this currently returns everything
                    
                    var drives = filterTripsByDate(drives_result.data, date);//returns trips for chosen date
                    if(drives.length > 0){
                        //var last_trip = drives[drives.length-1];
                        addParking({
                            'unit_id': result[unit].itemId,
                            'end_time': drives[drives.length-1].tripEndTime.split(' ')[1],
                            'start_date':mySqlDateFormat(drives[drives.length-1].tripStartTime.split(' ')[0]),
                            'end_date':mySqlDateFormat(drives[drives.length-1].tripEndTime.split(' ')[0]),
                            'on_time_status': drives[drives.length-1].tripEndTime.split(' ')[1] > "18:30",
                            'location_status': 0
                        });
                        var drivesDuration = [];

                        for(const index in drives){
                           // console.log(`Date : ${drives[index].tripStartTime}`)
                           if(drives[index].tripStartTime.split(' ')[1] > "08:00" && drives[index].tripEndTime.split(' ')[1] < "18:30:00"){
                                drivesDuration.push(drives[index].tripDuration);
                           }
                            
                           
                            addTrip({
                                'unit_id': result[unit].itemId,
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

                            })
                        }

                        
                        const totalSeconds = drivesDuration.reduce((total, duration) => total + timeToSeconds(duration), 0);
                        // console.log(`Day trips: ${timeToSeconds("9:30:00")} ${totalSeconds} ${((totalSeconds/timeToSeconds("9:30:00")) * 100).toFixed(2)} ${isFinite(((totalSeconds/timeToSeconds("9:30:00")) * 100).toFixed(2))}`)

                        var drivesSummary = {
                            'unit_id': result[unit].itemId,
                            'drives' : drives.length,
                            'day_drives': drivesDuration.length,
                            'drives_duration': secondsToTime(totalSeconds),
                            'off_time': isFinite(((totalSeconds/timeToSeconds("9:30:00")) * 100).toFixed(2)) ? ((totalSeconds/timeToSeconds("9:30:00")) * 100).toFixed(2) : 0,//show percentage
                            'date': date
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
      console.log(`Converted Date : ${trip.tripStartTime}, ${new Date(convertDateFormat(trip.tripStartTime)).getDate()} ${new Date(convertDateFormat(trip.tripStartTime)).getDate() === new Date(filterDate).getDate()}`)
      return (new Date(convertDateFormat(trip.tripStartTime)).getDate() === new Date(filterDate).getDate() )
    });
    //console.log(filteredTrips)
    console.log(`Filtered date called return : ${filteredTrips}`)
    return filteredTrips
  }

module.exports = {
    processTrips
}