const { bgsAuth, fetchDataFromExternalAPI } = require('../api/bgsAPI');
const { addTrip } = require('../services/bgsService');
const fetchBGSToken = async (req,res,next) => {
    try {
        const token = await bgsAuth({
            authID: 'Zamtel',
            authPassword: 'Zamtel@123'
         });
        req.token = token;
        next();
    } catch (error) {
        next(error);
    }

}

const fetchExternalData = async (req, res, next) => {
    try {
      const data = await fetchDataFromExternalAPI(req.token, 600210851);
      //console.log("This is it", data['data']['drives']);
      req.trips = data['data']['drives'];
      next();
    } catch (error) {
      next(error);
    }
};

const postTrip = (req, res, next) => {
  var trip = {
    'start_time' : '',
    'end_time': '',
    'start_date':'',
    'end_date':'',
    'start_location': '',
    'end_location':'',
    'start_coordinates':'',
    'end_coordinates': ''
  }
  addTrip(trip);
  next()
  
}

module.exports = {
    fetchBGSToken,
    fetchExternalData,
    postTrip
}