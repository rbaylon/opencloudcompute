const { writeFile, readFileSync } = require('fs');
const LoginManager = require('./loginmanager');

class AppManager {
    constructor (cfg) {
        this.cfgpath = cfg;
    }
    saveConfig () {
         writeFile(this.cfgpath, JSON.stringify(this.data, null, 2), (err) => {
                if (err) {
                console.log('Failed to write updated data to config file');
                return;
                }
                console.log('Updated config successfully');
                this.loadConfig();
        });
    };

    loadConfig () {
        console.log("Config file loaded "+this.cfgpath);
        this.data = JSON.parse(readFileSync(this.cfgpath));
        if (! this.data.password_set){
            let lm = new LoginManager(this.data.secretkey);
            this.data.password = lm.genPasswordHash(this.data.password);
            this.data.password_set = true;
            this.data.Users.push({username: "admin", 
                password: this.data.password,
                role: "admin"
            });
            this.saveConfig();
        }
    }

    getUser (id) {
        if (typeof this.data.Users[id] === 'undefined'){
            return undefined;
        } else {
            return this.data.Users[id]
        }
    }

    addUser (user) {
        this.data.Users.push(user);
        this.saveConfig();
    }

    rmUser (id) {
        if (typeof this.data.Users[id] === 'undefined'){
            return undefined;
        } else {
            this.data.Users.splice(id, 1);
            this.saveConfig();
            return true;
        }
    }

    updateUser (id, user) {
        if (typeof this.data.Users[id] === 'undefined'){
            return undefined;
        } else {
            this.data.Users.splice(id, 1, user);
            this.saveConfig();
            return this.data.Users[id];
        }
    }
    getUserNames (){
        var usernames = [];
        for (var v of this.data.Users){
            usernames.push(v.username);
        }
        return usernames;
    }
    getUserByName (username){
        let data = undefined;
        for (var v of this.data.Users){
            if (v.username === username){
                data = v;
                break;
            }
        }
        return data;
    }
    addToken (token) {
      this.data.Tokens.push(token);
      this.saveConfig();
    }
    updateToken (id, token) {
      if (typeof this.data.Tokens[id] === 'undefined'){
        return undefined;
      } else {
        this.data.Tokens.splice(id, 1, token);
        this.saveConfig();
        return this.data.Tokens[id];
      }
    }
    rmToken (id) {
      if (typeof this.data.Tokens[id] === 'undefined'){
        return undefined;
      } else {
        this.data.Tokens.splice(id, 1);
        this.saveConfig();
        return true;
      }
    }
    getTokenByTokenId(token_id) {
      let data = undefined;
      for (var v of this.data.Tokens){
        if (v.token_id == token_id){
          data = v;
          break;
        }
      }
      return data;
    }
    getToken (id) {
        if (typeof this.data.Tokens[id] === 'undefined'){
            return undefined;
        } else {
            return this.data.Tokens[id]
        }
    }
}

module.exports = AppManager;
