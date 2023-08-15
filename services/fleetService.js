const dbConn = require('../config/db.config');

const getFleet = () => {
    //var fleet = ["1"];
    dbConn.query('SELECT * FROM fleet', function(error, result){
        if(error){
            //send back error
            console.log("There was an error")
            console.log(error)
            return [];
        }else{
            //send back success
            //console.log(`Hurray ${result}`)
            console.log("Fleet imported successfuly")
            return result
        }
    });
}

//add trips
function addTrip(data) {
    //console.log(`INSERT DATA ${data}`)
    dbConn.query('INSERT INTO drives SET ?', data, function(error, result){
        if(error){
            //send back error
            console.log(`Error inserting drives ${error}`)
        }else{
            //send back success
            console.log("Success")
        }
    });
}  

function addDrivesSummary(data) {
    //console.log(`INSERT DATA ${data}`)
    dbConn.query('INSERT INTO utilisation SET ?', data, function(error, result){
        if(error){
            //send back error
            console.log(`Error inserting drives ${error}`)
        }else{
            //send back success
            console.log("Success")
        }
    });
}  

function addParking(data) {
    //console.log(`INSERT DATA ${data}`)
    dbConn.query('INSERT INTO parking SET ?', data, function(error, result){
        if(error){
            //send back error
            console.log(`Error inserting parking ${error}`)
        }else{
            //send back success
            console.log("Success")
        }
    });
}  

// APIs

function apiUtilityDrives() {
    return dbConn.query('SELECT * FROM drives', function(error, result){
        if(error){
            //send back error
            console.log("There was an error")
            console.log(error)
            return [];
        }else{
            //send back success
            //console.log(`Hurray ${result}`)
           // console.log(`Drives imported successfuly ${JSON.stringify(result)}`)
            return result
        }
    });
}

module.exports = {
    addTrip,
    getFleet,
    addParking,
    addDrivesSummary,
    apiUtilityDrives
}