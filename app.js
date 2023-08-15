var createError = require('http-errors');
var express = require('express');
var path = require('path');

//var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cron = require('node-cron');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var { bgsAPI} = require('./api/bgsAPI');
var units = require('./api/units') 
var { processTrips } = require('./controllers/fleetController')
var { fetchBGSToken } = require('./services/bgsService')
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

app.use(async function(req, res, next){
  const token = await fetchBGSToken();
  await processTrips(token.data, "2023-08-12") //yyyy/mm/dd
  console.log(token);
  /* let weeks = ["2023-08-07","2023-08-08","2023-08-09","2023-08-10","2023-08-11","2023-08-12","2023-08-13"]
  for(const index in weeks){
    const token = await fetchBGSToken();
    await processTrips(token.data, weeks[index]) //yyyy/mm/dd
    console.log(`Done week ${index}`);
  } */
  next()
})

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
var counter = 1;
cron.schedule('* * * * *', () => {
 // await bgsAPI.bgsAuth({
   // authID: 'Zamtel',
    //authPassword: 'Zamtel@123'
  //})
  console.log(`running a task every minute since ${counter++} minutes ago`);
});

module.exports = app;
