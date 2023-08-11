const express = require('express')
const { postTrip } = require('../middleware/bgsMiddleware')


const bgsRouter = express.Router();

bgsRouter.get('/', postTrip, (req, res) => {
    res.send("Great");
});

module.exports = bgsRouter