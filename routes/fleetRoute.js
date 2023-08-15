const express = require('express');
const { getTrips,getParkings, getUtilisation,getUnits, getFleet,getFleetStatus} = require('../middleware/fleetMiddleware')

const fleetRouter = express.Router()

fleetRouter.get('/', getFleet, (req, res, next) => {
    res.json(req.fleet);
})

fleetRouter.get('/fleet_status', getFleetStatus, (req, res, next) => {
    res.json(req.fleet_status);
})

fleetRouter.get('/trips', getTrips, (req, res, next) => {
    //res.send("Fleet Route")
    //console.log(JSON.stringify(req.trips))
    res.json(req.trips);
})

fleetRouter.get('/parkings',getParkings, (req, res, next) => {
    //res.send("Fleet Route")
    //console.log(JSON.stringify(req.trips))
    res.json(req.parking_time );
})

fleetRouter.get('/util',getUtilisation, (req, res, next) => {
    //res.send("Fleet Route")
    //console.log(JSON.stringify(req.trips))
    res.json(req.utilisation );
})

fleetRouter.get('/unit', getUnits, (req, res, next) => {
    //res.send("Fleet Route")
    //console.log(JSON.stringify(req.trips))
    res.json(req.units);
})



module.exports = fleetRouter