const shortid = require('shortid');
const User = require('./user.js').User;
const mainRoomId = 'main';

function auth(socket, users) {
  socket.on('register', (data) => {
    let stat = register(data.uname, data.pwd, users);
    if (stat) socket.emit('registerSuccess', {
      'message': 'Register succeed'
    });
    else socket.emit('appError', {
      'message': 'User already registered'
    });
  });

  socket.on('login', (data) => {
    let user = login(data.uname, data.pwd, users);
    if (user.id) socket.emit('loginSuccess', {
      'message': "Login succeed",
      'user': user
    });
    else socket.emit('appError', {
      'message': 'Login failed'
    });
  });

  function checkRegister(uname, users) {
    return !users.find(user => user.username === uname)
  }

  function checkLogin(uname, pwd, users) {
    const user = users.find(user => user.username === uname && user.password === pwd);
    return user ? user : false;
  }

  function register(uname, pwd, users) {
    if (!checkRegister(uname, users)) return false;
    let id = shortid.generate();
    let user = new User(id, uname, pwd);
    users.push(user);
    return true;
  }

  function login(uname, pwd, users) {
    let user = checkLogin(uname, pwd, users);
    if (!user) return false;
    socket.username = uname;
    socket.join(mainRoomId);

    return {
      id: user.id,
      username: user.username
    };
  }
}

exports.auth = auth;
