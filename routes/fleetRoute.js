const express = require('express')
const {
  getTrips,
  getParkings,
  getUtilisation,
  getUnits,
  getFleet,
  getFleetStatus
} = require('../middleware/fleetMiddleware')

const {
  processTrips,
  checkTripsInGeofences,
} = require('../controllers/fleetController')

var { fetchBGSToken } = require('../services/bgsService')

const fleetRouter = express.Router()

//these APIs are generally 
fleetRouter.get('/', getFleet, (req, res, next) => {
  res.json(req.fleet)
})

fleetRouter.get('/fleetstatus', getFleetStatus, (req, res, next) => {
  res.json(req.fleetstatus)
})

fleetRouter.get('/_drives', getTrips, (req, res, next) => {
  res.json(req.drives)
})

fleetRouter.get('/_parkings', getParkings, (req, res, next) => {
  res.json(req.parking_time)
})

fleetRouter.get('/_vehicle_utilisation', getUtilisation, (req, res, next) => {
  res.json(req.utilisation)
})

fleetRouter.get('/unit', getUnits, (req, res, next) => {
  res.json(req.units)
})

fleetRouter.get('/update/trips/:date', async (req, res, next) => {
  await processTrips(req.params.date)
  res.json(req.params)
})

fleetRouter.get('/update/parking_location', async (req, res, next) => {
  await checkTripsInGeofences()
  res.json(req.params)
})

fleetRouter.get('/get_provinces', (req, res, next) => {
  res.json([
    'Northern',
    'Southern',
    'North Western',
    'Luapula',
    'Lusaka',
    'Copperbelt',
    'Central',
    'Eastern',
    'Western',
    'Muchinga'
  ])
})

module.exports = fleetRouter
