var express = require('express');
var fleetRouter = require('./fleetRoute');
var fuelRouter = require('./fuelRoute');
var tripsRouter = require('./tripsRoute');

var router = express.Router();

const defaultRoutes = [
  {
    path: '/fleet',
    route: fleetRouter
  },
  {
    path: '/fuel',
    route: fuelRouter
  },
  {
    path: '/trips',
    route: tripsRouter
  }
]

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
