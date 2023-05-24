let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let tokenRouter = require('./routes/tokens');


let app = express();

// load fullkube 
const AppManager = require('./mylib/appmanager');
apcfgfile = './cfg/config.json';
let ap = new AppManager(apcfgfile);
ap.loadConfig();
app.set('ap', ap);

// custom validator
const InputValidator = require('./mylib/validators');
let iv = new InputValidator();
app.set('iv', iv);

// Load login manager
const LoginManager = require('./mylib/loginmanager');
let lm = new LoginManager(ap.data.secretkey);
app.set('lm', lm);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/tokens', tokenRouter);

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

module.exports = app;
