"use strict";
let express = require('express');
let router = express.Router();
let md = require('../mylib/middleware');
const crypto = require('crypto');

/* GET users listing with CRUD */
let roles = ["admin", "consumer"];
let schema_type = 'IPaddresses';
router.get('/', md.loginRequired(roles), function(req, res, next) {
  let ap = req.app.get('ap');
  res.json({message: 'Get all network/ip api', tokens: ap.data.ipaddresses});
})
.get(
  '/:id(\\d+)', md.loginRequired(roles), function(req, res){
  }
).post(
  '/new', md.loginRequired(roles), md.validateInput(schema_type), function(req, res){
  }
).put(
  '/:id(\\d+)', md.loginRequired(roles), md.validateInput(schema_type), function(req, res){
  } 
).delete(
  '/:id(\\d+)', md.loginRequired(roles), md.validateInput(schema_type), function(req, res){
  } 
);

module.exports = router;
