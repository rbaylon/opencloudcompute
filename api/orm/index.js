"use strict";
const { Sequelize } = require('sequelize');
const AppManager = require('../mylib/appmanager');
const appdir = __dirname.replace('/orm', '');
let apcfgfile = `${appdir}/cfg/config.json`;
let ap = new AppManager(apcfgfile);
ap.loadConfig();

function _applyRelation(seq){
	const { user, role, token } = seq.models;
  user.belongsToMany(role, { through: 'UserRoles' });
  role.belongsToMany(user, { through: 'UserRoles' });
  user.hasMany(token);
  token.belongsTo(user);
}

let user = ap.data.DB_INFO.user;
let password = ap.data.DB_INFO.password;
let host = ap.data.DB_INFO.host;
let port = ap.data.DB_INFO.port;
let dbname = ap.data.DB_INFO.database;
const sequelize = new Sequelize(`postgres://${user}:${password}@${host}:${port}/${dbname}`);
const modelDefiners = [
  require('./models/user.model'),
  require('./models/role.model'),
  require('./models/token.model')
];
for (const modelDefiner of modelDefiners) {
  modelDefiner(sequelize);
}
_applyRelation(sequelize);
ap = undefined;


module.exports = sequelize;
