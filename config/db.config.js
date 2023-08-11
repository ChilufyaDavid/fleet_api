const mysql = require('mysql')

const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rainbowsky',
    database: 'fleet_management_database'
});

module.exports = mysqlConnection