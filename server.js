//node server
var express=require('express');
var app=express();
var server=require('http').createServer(app);
var io=require('socket.io').listen(server);
var cont=1;
var contRooms=1;
var aux="";
var util = require("util");
users=[];
connections=[];

server.listen(process.env.PORT || 3000);
console.log('servidor corriendo');

app.get('/',function(req,res){
  res.sendFile(__dirname + '/index.html');
});

//principal
io.sockets.on('connection',function(socket){

  //variables directas de conexión
  //socket.emit('connection',"hola respuesta");
  connections.push(socket);
  //socket.emit('res',"hola andrea");
  socket.username=cont;
  cont++;
  console.log('conectado el '+socket.username+': hay %s',connections.length);

  //desconexión
  socket.on('disconnect',function(data){
    aux=socket.username;
    socket.leave(socket.room);
    socket.to(socket.room).emit('bye');
    connections.splice(connections.indexOf(socket),1);
    console.log('desconectado el '+aux+': hay %s',connections.length);
  })

  socket.on('jugar',function(data){
    //io.sockets.emit('new message',{msg:data});
    console.log(data);
    io.sockets.emit('res',"hola andrea");
  });

  //enviar mensaje
  socket.on('send message',function(data){
    //io.sockets.emit('new message',{msg:data});
    socket.to(socket.room).emit('message', {msg:data.msg});
  });

  //enviar tablero del cuarto
  socket.on('send board',function(data){
    socket.emit('board',{tablero:io.sockets.adapter.rooms[socket.room].board});
  })

  //enviar oponente al oponente
  socket.on('send opponent',function(data){
    //console.log(socket.username+' pide oponente');
    socket.to(socket.room).emit('opponent', {opponent:socket.username});
  })

  //enviar cuarto en el que está el cliente que lo pide
  socket.on('sendRoom',function(){

    if(contRooms%2==1){
      contRooms++;
      aux="room"+contRooms/2;
      socket.rol=1;
    }
    else {
      aux="room"+contRooms/2;
      contRooms++;
      socket.rol=2;
    }
    socket.join(aux);
    socket.room=aux;

    //prueba de guardar arreglo de juego como variable del room
    /*if(aux=="room1"){
      io.sockets.adapter.rooms[aux].board =
      [['-','-','-','-','-','-','-'],
      ['-','-','-','-','-','-','-'],
      ['-','-','-','-','-','-','-'],
      ['-','-','-','-','-','-','-'],
      ['-','-','-','-','-','-','-'],
      ['-','-','-','-','-','-','-']];
    }
    else {
      io.sockets.adapter.rooms[aux].board =
      [['Y','E','S','-','-','-','-'],
      ['-','-','-','-','-','-','-'],
      ['-','-','-','-','-','-','-'],
      ['-','-','-','-','-','-','-'],
      ['-','-','-','-','-','-','-'],
      ['-','-','-','-','-','-','-']];
    }*/

    /*socket.join(aux, () => {
    let rooms = Object.keys(socket.rooms);
    socket.room=rooms[1];
    aux=socket.room;

    //console.log(rooms[1]); // [ <socket.id>, 'room 237' ]
  });*/

  io.sockets.adapter.rooms[aux].board =
  [[0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0]];

  socket.emit('getRoom',socket.rol,aux);

  if(io.sockets.adapter.rooms[aux].length==2){
    io.in(socket.room).emit('game');
  }
});

})
