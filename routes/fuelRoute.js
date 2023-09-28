const express = require('express')

const {
  getFuel,
  processFuel,
  getFleet,
  addConsumptionDetails,
  getDrives,
  addActualConsumption
} = require('../services/fuelService')

const fuelRouter = express.Router()
// getFleet,addConsumptionDetails, getDrives, addActualConsumption,
fuelRouter.get(
  '/fuel_consumption',
  getFuel,
  processFuel,
  getFleet,
  addConsumptionDetails,
  getDrives,
  addActualConsumption,
  (req, res, next) => {
    res.send(req.fuel_summary)
  }
)

module.exports = fuelRouter
