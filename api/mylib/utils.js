"use strict";
class SchemaKeys {
    constructor () {
        this.userKeys = ["username", "password", "role"];
        this.tokenKeys = ["token", "token_id", "is_active", "owner"];
        this.tokenNewKeys = ["expiry", "owner"];
    }
}

function getItemFromObjs(key, val, objs){
  for(let obj of objs){
    if (obj.get(key) == val) return obj;
  }
  return null;
}

module.exports = { 
  SchemaKeys, 
  getItemFromObjs
};
