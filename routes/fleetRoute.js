const express = require('express');
const { getTrips } = require('../middleware/fleetMiddleware')

const fleetRouter = express.Router()

fleetRouter.get('/', getTrips, (req, res, next) => {
    //res.send("Fleet Route")
    res.json({'trips':req.trips});
})

module.exports = fleetRouter