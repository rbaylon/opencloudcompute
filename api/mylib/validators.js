"use strict";
const { SchemaKeys }= require("./utils");

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
        if (user.username) {
          if ( ! this.strLengthValid(user.username, 15, 3)){
            return {message: "Username length must be 3 to 15 characters.", isOK: false};
          }
        } else {
          return {message: "username parameter required.", isOK: false};
        }
        if (user.password) {
          if (! this.strLengthValid(user.password, 30, 8)){
            return {message: "Password length must be 8 to 30 characters.", isOK: false};
          }
        } else {
          return {message: "password parameter required.", isOK: false};
        }
        if (user.role) {
          if (! this.strLengthValid(user.role, 10, 2)){
            return {message: "Role length must be 2 to 10 characters.", isOK: false};
          }
        } else {
          return {message: "role parameter required.", isOK: false};
        }
        if (! this.strIsAlNum(user.username)) {
            return {message: "Username must not include special characters.", isOK: false};;
        }
        for (let key in user) {
            if (! this.sk.userKeys.includes(key)) {
                return {message: `Invalid key: ${key}`, isOK: false};
            }
        }
        return {message: "Input OK", isOK: true};
    }
    validateUserPw(pw) {
      if (! this.strLengthValid(pw, 30, 8)){
        return {message: "Password length must be 8 to 30 characters.", isOK: false};
      }
      return {message: "Input OK", isOK: true};
    } 
    validateUserRole(role){
      if (! this.strLengthValid(role, 10, 2)){
        return {message: "Role length must be 2 to 10 characters.", isOK: false};
      }
      return {message: "Input OK", isOK: true};
    } 
    validateToken (token, newreq=false) {
      if (newreq) {
         if (typeof token.owner === 'undefined' || typeof token.expiry === 'undefined') {
          return {message: "missing parameter", isOK: false};
        }
        for (let key in token) {
          if (! this.sk.tokenNewKeys.includes(key)) {
            return {message: `Invalid key: ${key}`, isOK: false};
          }
        }
        return {message: "Input OK", isOK: true};
      } else {
        if (typeof token.token === 'undefined' || typeof token.token_id === 'undefined' || typeof token.is_active === 'undefined' || typeof token.owner === 'undefined') {
          return {message: "missing parameter", isOK: false};
        }
        for (let key in token) {
          if (! this.sk.tokenKeys.includes(key)) {
            return {message: `Invalid key: ${key}`, isOK: false};
          }
        }
        return {message: "Input OK", isOK: true};
      }
    }
}

module.exports = InputValidator;
