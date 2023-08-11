const express = require('express')
const { fetchBGSToken } = require('../services/bgsService');
const { getFleet } = require('../services/fleetService');

const { processTrips } = require('../controllers/fleetController');

const homeRoute = express.Router();

homeRoute.get('/',async (req, res) => {
    //var token = fetchBGSToken();
    //var units = await getFleet();
    //console.log(`Flltt ${units}`)
    //processTrips(units, token);
    res.render('index', { title: 'Express', token : 'token', fleet:  'units' });
}); 

module.exports = homeRoute;