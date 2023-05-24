"use strict";
let express = require('express');
let router = express.Router();
let md = require('../mylib/middleware');

/* GET users listing with CRUD */
let roles = ["admin"];
let schema_type = 'Users';
router.get('/', md.loginRequired(roles), function(req, res, next) {
  let ap = req.app.get('ap');
  res.json({message: 'Get all users api', users: ap.data.Users});
})
.get(
  '/:id(\\d+)', md.loginRequired(roles), md.getUser, function(req, res){
    res.json(req.user);
  }
).post(
  '/new', md.loginRequired(roles), md.validateInput(schema_type), function(req, res){
    let ap = req.app.get('ap');
    let lm = req.app.get('lm');
    let apuser = req.body;
    apuser.password = lm.genPasswordHash(apuser.password);
    ap.addUser(apuser);
    res.status(201).json({added: apuser})
  }
).put(
  '/:id(\\d+)', md.loginRequired(roles), md.getUser, md.validateInput(schema_type), function(req, res){
    let ap = req.app.get('ap');
    let apuser = req.body;
    apuser.password = lm.genPasswordHash(apuser.password);
    ap.updateUser(req.params.id, apuser);
    res.json({updated: ap.data.Users[req.params.id]});
  } 
).delete(
  '/:id(\\d+)', md.loginRequired(roles), md.getUser,  function(req, res){
    let ap = req.app.get('ap');
    ap.rmUser(req.params.id);
    res.json({deleted: req.user});
  } 
);

router.get('/login', md.checkPassword, function (req, res){
  let lm = req.app.get('lm');
  let token = lm.genToken(req.username);
  res.json({token: token});
});


module.exports = router;
