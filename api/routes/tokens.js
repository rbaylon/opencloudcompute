"use strict";
let express = require('express');
let router = express.Router();
let md = require('../mylib/middleware');
const crypto = require('crypto');

/* GET users listing with CRUD */
let roles = ["admin"];
let schema_type = 'Tokens';
router.get('/', md.loginRequired(roles), function(req, res, next) {
  let ap = req.app.get('ap');
  res.json({message: 'Get all tokens api', tokens: ap.data.Tokens});
})
.get(
  '/:id(\\d+)', md.loginRequired(roles), function(req, res){
    let ap = req.app.get('ap');
    let token = ap.getToken(req.params.id)
    if(typeof token === 'undefined'){
      res.status(404).json({message: `Resource ${req.params.id} not found.`});
    } else {
      res.json(token);
    }
  }
).post(
  '/new', md.loginRequired(roles), function(req, res){
    let ap = req.app.get('ap');
    let data = req.body;
    if ( typeof data.owner === 'undefined' || typeof data.expiry === 'undefined') { 
      res.status(422).json({message: "Missing owner or expiry parameter!"}); 
    } else {
      let userdata = ap.getUserByName(data.owner);
      if (userdata === 'undefined') {
        let salt = crypto.randomBytes(16).toString('hex');
        let pw = crypto.randomBytes(8).toString('hex');
        let hash = crypto.pbkdf2Sync(pw, salt, 1000, 32, `sha512`).toString(`hex`);
        userdata = {
          username: data.owner,
          password: hash+':'+salt,
          role: "consumer"
        };
        ap.addUser(userdata);
      }
      let lm = req.app.get('lm');
      let token = lm.genToken(data.owner, data.expiry);
      let decoded = lm.verifyToken(token);
      let newtoken = {
        token: token,
        token_id: decoded.token_id,
        is_active: true,
        owner: data.owner
      };
      ap.addToken(newtoken);
      res.status(201).json({added: newtoken});
    }
  }
).put(
  '/:id(\\d+)', md.loginRequired(roles), md.validateInput(schema_type), function(req, res){
    let ap = req.app.get('ap');
    let tokendata = req.body;
    ap.updateToken(req.params.id, tokendata);
    res.json({updated: ap.data.Tokens[req.params.id]});
  } 
).delete(
  '/:id(\\d+)', md.loginRequired(roles), function(req, res){
    let ap = req.app.get('ap');
    let rmtoken = ap.getToken(req.params.id);
    ap.rmToken(req.params.id);
    res.json({deleted: rmtoken});
  } 
);

module.exports = router;
