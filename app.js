var createError = require('http-errors');
var express = require('express');
var path = require('path');

//var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cron = require('node-cron');

var indexRouter = require('./routes/index');
const { runDrives, getDrives } = require('./controllers/TripsController')
const { unitBatches } = require('./services/tripsService')
var { fetchBGSToken } = require('./services/bgsService');


var app = express();

//var bgsAuth = 
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use( function(req, res, next){

  //updateData();
  next()
})

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
 
  
  console.log(`Current Date: ${year}-${month}-${day}`);
  //console.log(convertDateFormat(currentDate));
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

cron.schedule('0 07 * * *', async () => {
  const currentDate = new Date();
  const yesterday = new Date(currentDate)
  yesterday.setDate(today.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = yesterday.getMonth() + 1; // Months are 0-based, so add 1
  const day = yesterday.getDate();
  let req = {batches:[]};
  unitBatches(req)
  const token = await fetchBGSToken()
  runDrives(req.batches, token, `${year}-${month}-${day}`, getDrives)
  console.log(`Update task running on this date; ${year}-${month}-${day}` )
});

module.exports = app;
