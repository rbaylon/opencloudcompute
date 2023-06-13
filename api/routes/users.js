"use strict";
const express = require('express');
const router = express.Router();
const md = require('../mylib/middleware');
const { models } = require('../orm');


/* GET users listing with CRUD */
let roles = ["admin"];
let schema_type = 'Users';
router.get('/', md.loginRequired(roles), async function(req, res, next) {
  const users = await models.user.findAll({include: models.role});
  res.json({message: 'Get all users api', users: users});
})
.get(
  '/:id(\\d+)', md.loginRequired(roles), md.getUser, function(req, res){
    res.json(req.user);
  }
).post(
  '/new', md.loginRequired(roles), md.validateInput(schema_type), async function(req, res){
    let lm = req.app.get('lm');
    let newuser = { 
      username: req.body.username,
      password: lm.genPasswordHash(req.body.password)
    };
    newuser = await models.user.create(newuser);
    await newuser.addRole(req.role);
    if(!req.resSent) res.status(201).json({added: newuser});
  }
).put(
  '/:id(\\d+)', md.loginRequired(roles), md.getUser, md.validateInput(schema_type), async function(req, res){
    let lm = req.app.get('lm');
    let apuser = req.body;
    if (apuser.password) {
      apuser.password = lm.genPasswordHash(apuser.password);
      await req.userdata.update({password: apuser.password});
    }
    if (apuser.role) {
      if (apuser.role.match(/^\-/)){
        await req.userdata.removeRole(req.role);
      } else {
        let roles = await req.userdata.roles;
        let rolelist = [];
        for (let role of roles){
          rolelist.push(role.role_name);
        }
        if (! rolelist.includes(apuser.role)) await req.userdata.addRole(req.role);
      }
    }
    if (!req.resSent) res.json({updated: await req.userdata.reload()});
  } 
).delete(
  '/:id(\\d+)', md.loginRequired(roles), md.getUser, async function(req, res){
    await req.user.destroy();
    res.json({deleted: 'yes'});
  } 
);

router.get('/login', md.checkPassword, async function (req, res){
  let lm = req.app.get('lm');
  let token = lm.genToken(req.username);
  let tokendata = {token: token, active: true};
  tokendata = await models.token.create(tokendata);
  let user = await models.user.findOne({where: {username: req.username}});
  await user.addToken(tokendata);
  res.json({token: token});
});

router.get('/flushtokens/:id(\\d+)', md.loginRequired(roles), async function(req, res){
  let tokens = await models.token.findAll({where: {userId: req.params.id}});
  if(tokens.length > 0){
    console.log(tokens);
    for (let t of tokens){
      await t.destroy();
    }
    res.json({message: 'All tokens deleted.'});
  } else {
    res.status(404).json({message: 'no token found'});
  }
});

module.exports = router;
