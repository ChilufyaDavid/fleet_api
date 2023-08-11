const { apiUtilityDrives } = require('../services/fleetService');

const getTrips = async (req, res, next) => {
    try {
      const data = await apiUtilityDrives();
      console.log("This is it" + data);
      req.trips = JSON.stringify(data);
      next();
    } catch (error) {
      next(error);
    }
};


module.exports = {
    getTrips
}