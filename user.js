/**
 * Created by techmaster on 3/24/17.
 */

class User {
  constructor(id, usr, pwd) {
    this.id = id;
    this.username = usr;
    this.password = pwd;
  }
}

module.exports.User = User;
