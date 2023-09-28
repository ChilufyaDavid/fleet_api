//const { apiUtilityDrives } = require('../services/fleetService');
const dbConn = require('../config/db.config')

const getFleet = (req, res, next) => {
  try {
    dbConn.query('SELECT * FROM fleet', function (error, result) {
      if (error) {
        console.log('There was an error')
        console.log(error)
      } else {
        req.fleet = result
        next()
      }
    })
  } catch (error) {
    next(error)
  }
}

const getFleetStatus = (req, res, next) => {
  try {
    dbConn.query('SELECT * FROM fleet_status', function (error, result) {
      if (error) {
        console.log('There was an error')
        console.log(error)
      } else {
        req.fleetstatus = result
        next()
      }
    })
  } catch (error) {
    next(error)
  }
}

const getReportSummary = (req, res, next) => {
  try {
    dbConn.query('SELECT * FROM drives', function (error, result) {
      if (error) {
        console.log('There was an error')
        console.log(error)
      } else {
        req.trips = result
        next()
      }
    })
  } catch (error) {
    next(error)
  }
}

const getTrips = (req, res, next) => {
  try {
    dbConn.query('SELECT * FROM drives', function (error, result) {
      if (error) {
        //send back error
        console.log('There was an error')
        console.log(error)
        //return [];
      } else {
        //send back success
        //console.log(`Hurray ${result}`)
        // console.log(`Drives imported successfuly ${JSON.stringify(result)}`)
        //return result
        req.drives = result
        next()
      }
    })
    //console.log(data);
  } catch (error) {
    next(error)
  }
}

const getSpeeding = (req, res, next) => {
  try {
    dbConn.query('SELECT * FROM drives', function (error, result) {
      if (error) {
        console.log('There was an error')
        console.log(error)
      } else {
        req.trips = result
        next()
      }
    })
  } catch (error) {
    next(error)
  }
}

const getUtilisation = (req, res, next) => {
  try {
    dbConn.query('SELECT * FROM utilisation', function (error, result) {
      if (error) {
        console.log('There was an error')
        console.log(error)
      } else {
        console.log(result)
        req.utilisation = result
        next()
      }
    })
  } catch (error) {
    next(error)
  }
}

const getParkings = (req, res, next) => {
  try {
    dbConn.query('SELECT * FROM parking', function (error, result) {
      if (error) {
        console.log('There was an error')
        console.log(error)
      } else {
        req.parking_time = result
        next()
      }
    })
  } catch (error) {
    next(error)
  }
}

const getDepartments = (req, res, next) => {
  try {
    dbConn.query('SELECT * FROM drives', function (error, result) {
      if (error) {
        console.log('There was an error')
        console.log(error)
      } else {
        req.trips = result
        next()
      }
    })
  } catch (error) {
    next(error)
  }
}

const getUnits = (req, res, next) => {
  try {
    dbConn.query('SELECT * FROM units', function (error, result) {
      if (error) {
        console.log('There was an error')
        console.log(error)
      } else {
        req.units = result
        next()
      }
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getTrips,
  getParkings,
  getUtilisation,
  getUnits,
  getFleet,
  getFleetStatus,
  getSpeeding
}
