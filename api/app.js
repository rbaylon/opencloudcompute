"use strict";
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sequelize = require('./orm');

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');


let app = express();

// load fullkube 
const AppManager = require('./mylib/appmanager');
let apcfgfile = './cfg/config.json';
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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// init db
async function assertDatabaseConnectionOk() {
	console.log(`Checking database connection...`);
	try {
		await sequelize.authenticate();
		console.log('Database connection OK!');
    if (ap.data.DB_INFO.create_tables) {
      await sequelize.sync();
      if(ap.data.first_run){
        const { models } = require('./orm');
        let admin_user = {
          username: "admin",
          password: lm.genPasswordHash(ap.data.admin_password),
        };
        let roles = ['admin', 'user', 'consumer'];
        for (const role_name of roles){
          await models.role.create({role_name: role_name});
        }
        await models.user.create(admin_user);
        await models.UserRoles.bulkCreate([
          {userId: 1, roleId: 1},
          {userId: 1, roleId: 2},
          {userId: 1, roleId: 3}
        ]);
        ap.data.admin_password = admin_user.password;
        ap.data.first_run = false;
      }
      ap.data.DB_INFO.create_tables = false;
      ap.saveConfig();
    }
    if (ap.data.DB_INFO.update_tables) { 
      await sequelize.sync({ alter: true});
      ap.data.DB_INFO.update_tables = false;
      ap.saveConfig();
    }
	} catch (error) {
		console.log('Unable to connect to the database:');
		console.log(error.message);
		process.exit(1);
	}
}



async function db_init() {
	await assertDatabaseConnectionOk();
	console.log(`Starting Sequelize...Done`);
}

db_init(); 

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
