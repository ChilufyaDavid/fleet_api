const express = require('express')
const { runDrives, getDrives } = require('../controllers/TripsController')
const { unitBatches } = require('../services/tripsService')
const { fetchBGSToken } = require('../services/bgsService')

const tripsRouter = express.Router()

tripsRouter.get('/:_date', async (req, res, next) => {
  req._date = req.params._date
  unitBatches(req)
  const token = await fetchBGSToken()
  await runDrives(req.batches, token, req._date, getDrives)
  res.send('Data processed or something')
})

module.exports = tripsRouter
