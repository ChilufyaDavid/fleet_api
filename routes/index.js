var express = require('express');
var homeRoute = require('./homeRoute');
var bgsRouter = require('./bgsRoute')
var fleetRouter = require('./fleetRoute');

var router = express.Router();

const defaultRoutes = [
  {
    path : '/',
    route: homeRoute
  },
  {
    path: '/trips',
    route: bgsRouter
  },
  {
    path: '/fleet',
    route: fleetRouter
  }
]

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
