"use strict";
let jwt = require('jsonwebtoken');
let crypto = require('crypto');

class LoginManager {
    constructor (secret) {
        this.isAuthenticated = false;
        this.secret = secret;
        this.saltlen = 16;
        this.hashlen = 32;
        this.iter = 1000;
        this.tokenexpr = 86400;
    }
    genToken (user, expr = undefined){
        expr = (expr) ? expr : this.tokenexpr;
        let now = (expr*1000) + Date.now();
        let token = jwt.sign({
            authuser: user, 
            expiry: new Date(now)
          }, this.secret, { expiresIn: expr });
        return token;
    }
    verifyToken (token){
        let decoded = {success: false, error: '', expiry: '', token_id: ''};
        try {
            let ret = jwt.verify(token, this.secret);
            decoded.authuser = ret.authuser;
            decoded.success = true;
            decoded.expiry = ret.expiry;
            decoded.token_id = ret.token_id;
          } catch(err) {
            decoded.error = err;
          }
        return decoded;
    }
    genPasswordHash (password) {
        let salt = crypto.randomBytes(this.saltlen).toString('hex');
        let hash = crypto.pbkdf2Sync(password, salt, this.iter, this.hashlen, `sha512`).toString(`hex`);
        return hash+':'+salt;
    }
    checkPasswordHash (clearpw, hashedpw) {
        let hpw = hashedpw.split(':');
        let hash = crypto.pbkdf2Sync(clearpw, hpw[1], this.iter, this.hashlen, `sha512`).toString(`hex`);
        if (hash === hpw[0]){
            return true;
        } else {
            return false;
        }
    }
}

module.exports = LoginManager;
