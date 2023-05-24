"use strict";
class SchemaKeys {
    constructor () {
        this.userKeys = ["username", "password", "role"];
        this.tokenKeys = ["token", "token_id", "is_active", "owner"];
        this.tokenNewKeys = ["expiry", "owner"];
    }
}

module.exports = SchemaKeys;
