const {
  convertDateFormat,
  mySqlDateFormat,
  timeToSeconds,
  secondsToTime,
  getWeekNumber,
  compareDateStrings
} = require('../utils/dateUtils')
const { fetchBGSToken } = require('../services/bgsService')
const { fetchDataFromExternalAPI } = require('../api/bgsAPI')
const {
  createTrip,
  createVehicleUtilisation
} = require('../services/tripsService')
const { createParking } = require('../services/parkingService')

let butchNumber = '_1'

const runDrives = async (batches, token, date, _getDrives) => {
  let batchIndex = 0
  let tok = token
  const fetchData = async () => {
    if (batchIndex >= batches.length) {
      butchNumber = '_1'
      return
    }

    // Fetch data from the external API here.
    let response = await fetchDataFromExternalAPI(
      tok.data,
      JSON.parse(batches[batchIndex].batches),
      { from: '2023-06-01', to: '2023-06-01' }
    )

    try {
      if (batches[batchIndex].batch_name == '_27') {
        //update batcheNumber once batches have finished pulling or about to finish
        butchNumber = '_27'
      }
      // Update other data including daily_unit_status table or perform any necessary cleanup.
      if (response != null) {
        _getDrives(response['data'], date)
      }
    } catch (err) {
      console.log('Caught error', err)
    }

    if (batchIndex % 4 === 0) {
      //console.log("Reposting at index", batchIndex, batches[batchIndex].batch_name);
      tok = await fetchBGSToken() // Assuming this function exists.
    }

    batchIndex++

    // Continue fetching the next batch.
    fetchData()
  }

  // Start fetching the data.
  fetchData()
}

function getDrives (drives, date) {
  //returns a list of drives
  drives.forEach(drive => {
    //loops through each unit
    if (drive['drives'] != null) {
      filterDrivesByDate(
        drive['drives'],
        { unit_id: drive['unitId'], name: drive['name'] },
        date,
        processFilterdData
      )
    }
  })
}

function filterDrivesByDate (
  trips,
  tripSummaryObject,
  tripsDate,
  dailyTripsCallback
) {
  const filteredTrips = trips.filter(trip => {
    return compareDateStrings(tripsDate, convertDateFormat(trip.tripStartTime))
  })
  if (filteredTrips.length > 0) {
    dailyTripsCallback(filteredTrips, tripSummaryObject, tripsDate)
  } else {
    console.log('No drives for date : ', tripsDate)
  }
}

function processFilterdData (dailyTrips, tripSummaryObject, date) {
  //console.log("Creating parking", dailyTrips)
  let index = dailyTrips.length - 1
  createParking({
    unit_id: tripSummaryObject.unit_id,
    name: tripSummaryObject.name,
    parking_start_time: dailyTrips[index].tripEndTime.split(' ')[1],
    parking_end_time: '00:00:00',
    start_date: date, //mySqlDateFormat(date),
    end_date: date, //mySqlDateFormat(drives[drives.length-1].tripEndTime.split(' ')[0]),
    on_time_status: dailyTrips[index].tripEndTime.split(' ')[1] > '18:30',
    location_status: 'Undesignated',
    location: dailyTrips[index].finalLocation,
    end_coordinates: dailyTrips[index].finalCoordinates,
    week: getWeekNumber(new Date(date)),
    month: new Date(date).getMonth() + 1
  })
  let drivesDuration = []
  dailyTrips.forEach(el => {
    // loops through each unit's drive(returns trips for a single day)
    if (
      el.tripStartTime.split(' ')[1] > '08:00' &&
      el.tripEndTime.split(' ')[1] < '18:30:00'
    ) {
      drivesDuration.push(el.tripDuration)
    }
    createTrip({
      unit_id: tripSummaryObject.unit_id,
      name: tripSummaryObject.name,
      start_time: el.tripStartTime.split(' ')[1], //drives[index],
      end_time: el.tripEndTime.split(' ')[1],
      start_date: mySqlDateFormat(el.tripStartTime.split(' ')[0]),
      end_date: mySqlDateFormat(el.tripEndTime.split(' ')[0]),
      start_location: el.initialLocation,
      end_location: el.finalLocation,
      start_coordinates: el.initialCoordinates,
      end_coordinates: el.finalCoordinates,
      trip_duration: el.tripDuration,
      trip_off_time: el.tripOffTime,
      average_speed: el.averageSpeed.replace(/[^\d]/g, ''),
      mileage: el.mileage.replace(/[^\d]/g, ''),
      initial_mileage: el.initialMileage.replace(/[^\d]/g, ''),
      final_mileage: el.finalMileage.replace(/[^\d]/g, ''),
      max_speed: el.maxSpeed.replace(/[^\d]/g, ''),
      week: getWeekNumber(
        new Date(mySqlDateFormat(el.tripStartTime.split(' ')[0]))
      ),
      month:
        new Date(mySqlDateFormat(el.tripStartTime.split(' ')[0])).getMonth() +
        1,
      ec_latitude: el.finalCoordinates.split(', ')[0],
      ec_longitude: el.finalCoordinates.split(', ')[1],
      speed_violation_status: el.maxSpeed.replace(/[^\d]/g, '') > 80
    })
  })

  const totalSeconds = drivesDuration.reduce(
    (total, duration) => total + timeToSeconds(duration),
    0
  )
  let util_status = false

  if (isFinite((totalSeconds / timeToSeconds('9:30:00')).toFixed(2))) {
    //checks and updates the util status
    util_status = (totalSeconds / timeToSeconds('9:30:00')).toFixed(2) > 60
  } else {
    util_status = false
  }
  let drivesSummary = {
    unit_id: tripSummaryObject.unit_id,
    name: tripSummaryObject.name,
    drives: dailyTrips.length,
    day_drives: drivesDuration.length,
    drives_duration: secondsToTime(totalSeconds),
    off_time: isFinite((totalSeconds / timeToSeconds('9:30:00')).toFixed(2))
      ? (totalSeconds / timeToSeconds('9:30:00')).toFixed(2)
      : 0, //show percentage
    date: date,
    week: getWeekNumber(new Date(date)),
    month: new Date(mySqlDateFormat(date)).getMonth() + 1,
    utlisation_status: util_status
  }
  createVehicleUtilisation(drivesSummary, butchNumber)
}

module.exports = {
  runDrives,
  getDrives
}
