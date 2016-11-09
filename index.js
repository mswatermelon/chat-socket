const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

let users = {};
var rooms = ['General', 'Special', 'VIP'];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('adduser', function (username){
    socket.username = username;
    socket.room = 'General';
    users[username] = username;
    socket.join('General');
    socket.emit('chat message', 'SERVER', 'you have connected to General');
    socket.broadcast.to('General').emit('chat message', 'SERVER', username + ' has connected to this room');
    socket.emit('updaterooms', rooms, 'General');
  });

  socket.on('switchRoom', function(newroom){
    socket.leave(socket.room);
    socket.join(newroom);
    socket.emit('chat message', 'SERVER', 'you have connected to '+ newroom);
    socket.broadcast.to(socket.room).emit('chat message', 'SERVER', socket.username+' has left this room');
    socket.room = newroom;
    socket.broadcast.to(newroom).emit('chat message', 'SERVER', socket.username+' has joined this room');
    socket.emit('updaterooms', rooms, newroom);
  });

  socket.on('chat message', function(msg){
    io.sockets["in"](socket.room).emit('chat message', socket.username, msg);
  });

  socket.on('disconnect', function(){
    delete users[socket.username];

    socket.broadcast.emit('chat message', 'SERVER', socket.username + ' has disconnected');
    socket.leave(socket.room);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
