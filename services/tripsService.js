const dbConn = require('../config/db.config');
const { checkTripsInGeofences } = require('../controllers/fleetController');

const unitBatches = (req) => {
    dbConn.query('SELECT * FROM unit_batches', function(error, result){
        if(error){
            console.log("There was an error getting unit ids")
            console.log(error)
        }else{
            console.log("Unit Batches imported successfuly")
            req.batches = result;
        }
    });
}

function createTrip(data) {
    //console.log(`INSERT DATA ${data}`)
    //let count = 0;
    dbConn.query('INSERT INTO drives SET ?', data, function(error, result){
        if(error){
            //send back error
            console.log(`Error inserting drives ${error}`)
        }else{
            //send back success
            //console.log("Trip Success")
            //console.log(count++)
        }
    });
} 

function createVehicleUtilisation(data, batchNumber) {
    dbConn.query('INSERT INTO utilisation SET ?', data, function(error, result){
        if(error){
            //send back error
            console.log(`Error inserting drives ${error}`)
        }else{
            //send back success
            //console.log("Drive Summary Success")
            if(batchNumber == "_27"){// update parking
                console.log("Posting Geofence Started")
                checkTripsInGeofences()
            }
        }
    });
    //dbConn.end();
}  

module.exports  = {
    createTrip,
    unitBatches,
    createVehicleUtilisation
}