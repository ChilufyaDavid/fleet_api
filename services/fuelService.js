const { getWeekNumber } = require('../utils/dateUtils')
const dbConn = require('../config/db.config')

const standardConsumption = {
  'CHEVROLET AVEO': 9,
  'TOYOTA HILUX D 4x2': 8,
  'TOYOTA HILUX S/ CAB 4X2': 8,
  'TOYOTA HILUX S/ CAB': 8,
  'TOYOTA HILUX D/CAB 4X4': 8,
  'TOYOTA HILUX  S/CAB 4X4': 8,
  'TOYOTA HILUX D/CAB 4*2': 8,
  'TOYOTA HILUX D/ CAB 4X4': 8,
  'TOYOTA HILUX  D/CAB 4X4': 8,
  'TOYOTA HIACE MINIBUS': 8,
  'TOYOTA COROLLA AUTO': 8,
  'TOYOTA COROLLA': 8,
  'TOYOTA  LANDCRUISER VX': 8,
  'PHILSON MOTOR BIKE': 8,
  'NISSAN TRUCK': 8,
  'NISSAN HP 200': 10,
  'NISSAN HARDBODY D/CAB': 8,
  'NISSAN HARDBODY': 8,
  'NISSAN DIESEL(Truck)': 8,
  'MITSUBISHI SPORT': 8,
  'MITSUBISHI SHOGUN': 8,
  'MITSUBISHI PAJERO': 8,
  'HONDA MOTOR CYCLE ACE SERIES': 8,
  'HONDA MOTOR CYCLE': 8,
  'FOLK LIFT': 8,
  'BAJAJ MOTOR CYCLE': 8,
  'TOYOTA HILUX S/CAB 4X4': 8,
  'TOYOTA Coaster': 8,
  'TOYOTA Corolla': 10,
  Hilux: 8,
  LandCruiser: 6,
  Starlet: 9,
  Starle: 9,
  UD70: 3.5,
  Urbancruiser: 8
}

const getFuel = (req, res, next) => {
  dbConn.query('SELECT * FROM fuel', function (error, result) {
    if (error) {
      //send back error
      console.log('There was an error pulling fuel')
      console.log(error)
      //return [];
    } else {
      console.log('Fuel pulled ')
      //console.log(result.data)
      req.fuel = result.filter(fuel => fuel.product_code !== 'LUBRICANTS')
      next()
    }
  })
}

//weekly topups for per vehicle
const processFuel = (req, res, next) => {
  // Step 1: Add the 'week_num' property to each fuel object
  req.fuel.forEach(fuel => {
    const weekNumber = getWeekNumber(fuel.date) // Custom function to get the week number
    fuel.week_num = weekNumber
  })

  // Step 2: Group the fuel objects by 'registration' and 'week_num'
  const groupedFuels = req.fuel.reduce((groups, fuel) => {
    const key = `${fuel.registration}_${fuel.week_num}`
    if (!groups[key]) {
      groups[key] = { ...fuel, total_quantity: 0 }
    }
    groups[key].total_quantity += fuel.quantity
    return groups
  }, {})

  req.fuel_summary = Object.values(groupedFuels)
  next()
}

const getFleet = (req, res, next) => {
  //var fleet = ["1"];
  dbConn.query('SELECT * FROM fleet', function (error, result) {
    if (error) {
      //send back error
      console.log('There was an error')
      console.log(error)
      return []
    } else {
      //send back success
      //console.log(`Hurray ${result}`)
      console.log('Fleet imported successfuly')
      result.forEach(obj => {
        if (standardConsumption.hasOwnProperty(obj.description)) {
          obj.stand_consumption = standardConsumption[obj.description]
        } else {
          obj.stand_consumption = 8
        }
      })
      req.fleet = result
      next()
    }
  })
}

const addConsumptionDetails = (req, res, next) => {
  req.fuel_summary.forEach(fuelSum => {
    req.fleet.forEach(fleetObj => {
      if (fleetObj.registration === fuelSum.registration) {
        fuelSum.name = fleetObj.name
        fuelSum.stand_consumption = fleetObj.stand_consumption
      }
    })
  })

  //req.fuel_summary = consumption;
  next()
}

const getDrives = (req, res, next) => {
  const month = 7
  const sql = 'SELECT * FROM drives WHERE month = ?'
  dbConn.query(sql, [month], function (error, result) {
    if (error) {
      //send back error
      console.log('There was an error pulling fuel')
      console.log(error)
      //return [];
    } else {
      console.log('Drives pulled ')
      //console.log(result.data)

      const groupedDrive = result.reduce((groups, drive) => {
        const key = `${drive.name}_${drive.week}`
        if (!groups[key]) {
          groups[key] = { ...drive, total_mileage: 0 }
        }
        groups[key].total_mileage += drive.final_mileage
        return groups
      }, {})

      req.drives = Object.values(groupedDrive)
      next()
    }
  })
}

const addActualConsumption = (req, res, next) => {
  req.fuel_summary.forEach(fuelSum => {
    fuelSum.week_mileage = 0
    req.drives.forEach(drivesObj => {
      if (
        fuelSum.name === drivesObj.name &&
        fuelSum.week_num === drivesObj.week
      ) {
        fuelSum.week_mileage += parseInt(drivesObj.final_mileage)
        fuelSum.actual_consumption = Math.round(
          fuelSum.week_mileage / fuelSum.quantity
        )
        fuelSum.consumption_variance =
          fuelSum.stand_consumption - fuelSum.actual_consumption
      }
    })
  })
  next()
}

module.exports = {
  getFuel,
  processFuel,
  getFleet,
  addConsumptionDetails,
  getDrives,
  addActualConsumption
}
