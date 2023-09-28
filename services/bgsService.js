const { bgsAuth, fetchDataFromExternalAPI } = require('../api/bgsAPI')

const fetchBGSToken = async function () {
  try {
    const token = await bgsAuth({
      authID: '', //replace username
      authPassword: '' //replace password
    })
    console.log(`TOKEN OKAY ${token}`)
    return {
      code: '202',
      data: token
    }
  } catch (error) {
    console.log(`TOKEN ERROR ${error}`)
    return {
      code: '404', //or the relevavant code,
      data: error
    }
  }
}

const fetchExternalData = async function (unit_id, token, date) {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await fetchDataFromExternalAPI(token, unit_id, date)
      //console.log("This is it", data['data']['drives']);
      resolve({
        code: '202',
        data: data['data']['drives'] == null ? [] : data['data']['drives']
      })
    } catch (error) {
      reject({
        code: '404', //or the relevavant code,
        data: error
      })
    }
  })
}

module.exports = {
  fetchBGSToken,
  fetchExternalData
}
