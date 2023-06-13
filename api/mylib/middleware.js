"use strict";
const { getItemFromObjs } = require('../mylib/utils'); 
const { models } = require('../orm');

function sendError(res, payload, ok){
  if(ok){
    res.status(payload.statuscode).json({message: payload.message});
    return false;
  } else {
    return true;
  }
}

async function getUser (req, res, next){
    let apuser = await models.user.findOne({where: { id: req.params.id }, include: models.role});
    if(apuser){
      req.user = apuser;
      next();
    } else {
      res.status(404).json({message: 'Resource '+req.params.id+' not found.'});
    }
  }
  
  function validateInput (schema_type) {
    return async function(req, res, next) {
      let iv = req.app.get('iv');
      let ap = req.app.get('ap');
      let sendErr = true;
      if (! req.body){
        sendErr = sendError(res, {statuscode: 422, message: "Empty request body!"}, sendErr);
      }
      switch (schema_type) {
        case 'Users':
          if (req.method == 'POST'){
            let vru = iv.validateUser(req.body);
            if (vru.isOK) {
              let userdata = await models.user.findOne({where: {username: req.body.username}, include: models.role});
              if (userdata){
                sendErr = sendError(res, {statuscode: 409, message: req.body.username+" username already exist."}, sendErr);
              } else {
                let role = await models.role.findOne({where: {role_name: req.body.role}});
                if (role){
                  req.role = role;
                  sendErr = false;
                  next();
                } else {
                  sendErr = sendError(res, {statuscode: 404, message: `Role ${req.body.role} not found.`}, sendErr);
                }
              }
            } else {
              sendErr = sendError(res, {statuscode: 400, message: vru.message}, sendErr);
            }
          } else if (req.method == 'PUT'){
            let userdata = await models.user.findOne({where: {id: req.params.id}, include: models.role});
            if (userdata){
              req.userdata = userdata;
            } else {
              sendErr = sendError(res, {statuscode: 404, message: `User ID ${req.params.id} not found.`}, sendErr);
            }
            if (req.body.role) {
              let vruk = iv.validateUserRole(req.body.role);
              if (vruk.isOK) {
                let roledata = req.body.role;
                if (req.body.role.match(/^\-/)){
                  roledata = roledata.replace('-','');
                }
                let role = await models.role.findOne({where: {role_name: roledata}});
                if (role){
                  req.role = role;
                } else {
                  sendErr = sendError(res, {statuscode: 404, message: `Role ${req.body.role} not found!`}, sendErr);
                }
              } else {
                sendErr = sendError(res, {statuscode: 400, message: vruk.message}, sendErr);
              }
            }
            if (req.body.password) {
              let vruk = iv.validateUserPw(req.body.password);
              if (! vruk.isOK) {
                sendErr = sendError(res, {statuscode: 400, message: vruk.message}, sendErr);
              }
            }
            if(req.body.role || req.body.password) {
              sendErr = false;
              next();
            } else {
              sendErr = sendError(res, {statuscode: 400, message: 'role or password parameter required.'}, sendErr);
            }
          } else {
            sendErr = sendError(res, {statuscode: 405, message: `Method not allowed: ${req.method}.`}, sendErr);
          }
          break;
      }
      req.resSent = sendErr;
    }
  }
  
 function loginRequired(roles){
		return async function(req, res, next){
      let sendErr = true;
    	let lm = req.app.get('lm');
    	const token = (req.headers.authorization || '').split(' ')[1] || '';
    	if (token){
      	let decoded = lm.verifyToken(token);
      	if (decoded.success) {
					let userrecord = await models.user.findOne({where: {username: decoded.authuser}, include: models.role});
          let userrole = null;
          if(userrecord) {
            userrole = getItemFromObjs('role_name', 'admin', userrecord.get('roles'));
          } else {
            sendErr = sendError(res, {statuscode: 400, message: `Access denied for user ${userrecord.username}!`}, sendErr);
          }
					if (userrole && roles.includes(userrole.get('role_name'))) {
            let tokenrecord = await models.token.findOne({where: {token: token}});
            if (tokenrecord){
              req.username = decoded.authuser;
              sendErr = false;
              next();
            } else {
               sendErr = sendError(res, {statuscode: 400, message: `Access denied for user ${userrecord.username}!`}, sendErr);
            }
					} else {
            sendErr = sendError(res, {statuscode: 400, message: `Access denied for user ${userrecord.username}!`}, sendErr);
					}
      	} else {
          sendErr = sendError(res, {statuscode: 400, message: decoded.error}, sendErr);
      	}
    	} else {
        sendErr = sendError(res, {statuscode: 400, message: "Token required!"}, sendErr);
    	}
  	}
	}
  
async function checkPassword(req, res, next){
    const reqauth = (req.headers.authorization || '').split(' ')[1] || '';
    const [user, passwd] = Buffer.from(reqauth, 'base64').toString().split(':');
    let lm = req.app.get('lm');
    let userrecord = await models.user.findOne({where: {username: user}});
    if (userrecord){
      if (lm.checkPasswordHash(passwd, userrecord.get('password'))){
        req.username = userrecord.get('username');
        next();
      } else {
        res.status(400).json({message: "Invalid password."});
      }
    } else {
      res.status(403).json({message: "Invalid user."});
    }
  }

module.exports = { checkPassword, loginRequired, validateInput, getUser, sendError };
