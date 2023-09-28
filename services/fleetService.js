const dbConn = require('../config/db.config')

const getFleet = () => {
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
      return result
    }
  })
}

//add trips
function addTrip (data) {
  //console.log(`INSERT DATA ${data}`)
  let count = 0
  dbConn.query('INSERT INTO drives SET ?', data, function (error, result) {
    if (error) {
      //send back error
      console.log(`Error inserting drives ${error}`)
    } else {
      //send back success
      console.log('Trip Success')
      console.log(count++)
    }
  })
}


function addDrivesSummary (data) {
  //console.log(`INSERT DATA ${data}`)

  dbConn.query('INSERT INTO utilisation SET ?', data, function (error, result) {
    if (error) {
      //send back error
      console.log(`Error inserting drives ${error}`)
    } else {
      //send back success
      //console.log("Drive Summary Success")
    }
  })
  //dbConn.end();
}

function addParking (data) {
  //console.log(`INSERT DATA ${data}`)
  dbConn.query('INSERT INTO parking SET ?', data, function (error, result) {
    if (error) {
      //send back error
      console.log(`Error inserting parking ${error}`)
    } else {
      //send back success
      console.log('Parking Success')
    }
  })
}

const unitBatches = () => {
  dbConn.query('SELECT * FROM unit_batches', function (error, result) {
    if (error) {
      //send back error
      console.log('There was an error getting unit ids')
      console.log(error)
      return error
    } else {
      //send back success
      //console.log(`Hurray ${result}`)
      console.log('Unit Batches imported successfuly', result)
      return result
    }
  })
}

//add trips
function addBatch (data) {
  //console.log(`INSERT DATA ${data}`)
  dbConn.query(
    'INSERT INTO unit_batches (batch_name, batches) VALUES (?, ?)',
    [data.batch_name, JSON.stringify(data.batches)],
    function (error, result) {
      if (error) {
        //send back error
        console.log(`Error inserting batch ${error}`)
      } else {
        //send back success
        console.log('Bacht insert Success')
        console.log(data)
      }
    }
  )
}

//add geofence
function addGeofence (data) {
  //console.log(`INSERT DATA ${data}`)
  dbConn.query(
    'INSERT INTO geofences (name, description, points) VALUES (?,?,?)',
    [data.name, data.description, JSON.stringify(data.points)],
    function (error, result) {
      if (error) {
        //send back error
        console.log(`Error inserting geofence ${error}`)
      } else {
        //send back success
        console.log('geofence insert Success')
      }
    }
  )
}
//update parking with Geofence
function updateParking (id, location) {
  const updateQuery =
    'UPDATE parking SET location = ?, location_status = ? WHERE id = ?'

  dbConn.query(
    updateQuery,
    [location, 'Designated', id],
    function (error, result) {
      if (error) {
        //send back error
        console.log(`Error inserting geofence ${error}`)
      } else {
        //send back success
        console.log('parking update Success')
      }
    }
  )
}

// APIs

function apiUtilityDrives () {
  return dbConn.query('SELECT * FROM drives', function (error, result) {
    if (error) {
      //send back error
      console.log('There was an error')
      console.log(error)
      return []
    } else {
      return result
    }
  })
}

function updateFleetStatus (data) {
  const updateQuery =
    'UPDATE fleet_status SET department = ?, province = ?, location = ? WHERE registration = ?'

  dbConn.query(
    updateQuery,
    [data.department, data.province, data.location, data.registration],
    function (error, result) {
      if (error) {
        //send back error
        console.log(`Error inserting geofence ${error}`)
      } else {
        //send back success
        console.log('fleet status update Success')
      }
    }
  )
}

async function updateFleetCoord (data) {
  console.log(data.latitude)
  console.log(data.longitude)
  const updateQuery =
    'UPDATE drives SET ec_latitude = ?, ec_longitude = ? WHERE id = ?'

  return dbConn.query(
    updateQuery,
    [data.latitude, data.longitude, data.id],
    function (error, result) {
      if (error) {
        //send back error
        console.log(`Error inserting geofence ${error}`)
      } else {
        //send back success
        console.log(
          `drives update Success ${data.id} : ${data.latitude} : ${data.longitude}`
        )
      }
    }
  )
}

module.exports = {
  addTrip,
  getFleet,
  addParking,
  addDrivesSummary,
  unitBatches,
  apiUtilityDrives,
  addBatch,
  addGeofence,
  updateParking,
  updateFleetStatus,
  updateFleetCoord
}
