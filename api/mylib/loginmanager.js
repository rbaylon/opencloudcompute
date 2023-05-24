var jwt = require('jsonwebtoken');
var crypto = require('crypto');

class LoginManager {
    constructor (secret) {
        this.isAuthenticated = false;
        this.secret = secret;
        this.saltlen = 16;
        this.hashlen = 32;
        this.iter = 1000;
        this.tokenexpr = 8760;
    }
    genToken (user, expr = undefined){
        expr = (expr) ? expr : this.tokenexpr;
        var token = jwt.sign({
            authuser: user, 
            expiry: expr,
            token_id: crypto.randomBytes(this.saltlen).toString('hex')
          }, this.secret, { expiresIn: this.tokenexpr });
        return token;
    }
    verifyToken (token){
        var decoded = {success: false, error: '', expiry: '', token_id: ''};
        try {
            var ret = jwt.verify(token, this.secret);
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
        var salt = crypto.randomBytes(this.saltlen).toString('hex');
        var hash = crypto.pbkdf2Sync(password, salt, this.iter, this.hashlen, `sha512`).toString(`hex`);
        return hash+':'+salt;
    }
    checkPasswordHash (clearpw, hashedpw) {
        var hpw = hashedpw.split(':');
        var hash = crypto.pbkdf2Sync(clearpw, hpw[1], this.iter, this.hashlen, `sha512`).toString(`hex`);
        if (hash === hpw[0]){
            return true;
        } else {
            return false;
        }
    }
}

module.exports = LoginManager;
