const dbConn = require('../config/db.config');

function createParking(data) {
    dbConn.query('INSERT INTO parking SET ?', data, function(error, result){
        if(error){
            //send back error
            console.log(`Error inserting parking ${error}`)
        }else{
            //send back success
            console.log("Parking inserted Success")
        }
    });
} 

module.exports  = {
    createParking,
}