const SchemaKeys = require("./utils");

class InputValidator {
    constructor () {
        this.alnumPattern = /^[a-z0-9\-_]+$/;
        this.numPattern = /^\d+$/;
        this.sk = new SchemaKeys();
    }
    strLengthValid (input, max, min = 0) {
        this.strlen = input.length;
        if (this.strlen <= max && this.strlen >= min) {
            return true;
        }
        return false;
    }
    strIsAlNum (input){
        return this.alnumPattern.test(input);
    }
    strIsNum (input){
        return this.numPattern.test(input);
    }
    validateUser (user) {
        if (! this.strLengthValid(user.username, 15, 3)){
            return {message: "Username length must be 3 to 15 characters.", isOK: false};
        }
        if (! this.strLengthValid(user.password, 30, 8)){
            return {message: "Password length must be 8 to 30 characters.", isOK: false};
        }
        if (! this.strLengthValid(user.role, 10, 2)){
            return {message: "Role length must be 2 to 10 characters.", isOK: false};
        }
        if (! this.strIsAlNum(user.username)) {
            return {message: "Username must not include special characters.", isOK: false};;
        }
        for (var key in user) {
            if (! this.sk.userKeys.includes(key)) {
                return {message: `Invalid key: ${key}`, isOK: false};
            }
        }
        return {message: "Input OK", isOK: true};
    }
    validateToken (token) {
      if (typeof token.token === 'undefined' || typeof token.token_id === 'undefined' || typeof token.is_active === 'undefined' || typeof token.owner === 'undefined') {
        return {message: "missing parameter", isOK: false};
      }
      for (var key in token) {
        if (! this.sk.tokenKeys.includes(key)) {
          return {message: `Invalid key: ${key}`, isOK: false};
        }
      }
      return {message: "Input OK", isOK: true};
    }
}

module.exports = InputValidator;
