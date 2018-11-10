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
  connections.push(socket);
  socket.username=cont;
  cont++;
  console.log('conectado el '+socket.username+': hay %s',connections.length);

  //desconexión
  socket.on('disconnect',function(data){
    aux=socket.username;
    socket.to(socket.room).emit('bye');
    connections.splice(connections.indexOf(socket),1);
    console.log('desconectado el '+aux+': hay %s',connections.length);
  })

  //enviar mensaje
  socket.on('send message',function(data){
    //io.sockets.emit('new message',{msg:data});
    socket.to(socket.room).emit('message', {msg:data.msg});
  });

  //enviar tablero del cuarto
  socket.on('send board',function(data){
    socket.emit('board',{cuarto:io.sockets.adapter.rooms[socket.room].board});
  })

  //enviar cuarto en el que está el cliente que lo pide
  socket.on('send room',function(){

    if(contRooms%2==1){
      contRooms++;
      aux="room"+contRooms/2;
    }
    else {
      aux="room"+contRooms/2;
      contRooms++;
    }
    socket.join(aux);
    socket.room=aux;

    //prueba de guardar arreglo de juego como variable del room
    if(aux=="room1"){
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
    }

    //console.log(io.sockets.adapter.rooms[aux].board);

    /*socket.join(aux, () => {
    let rooms = Object.keys(socket.rooms);
    socket.room=rooms[1];
    aux=socket.room;

    //console.log(rooms[1]); // [ <socket.id>, 'room 237' ]
  });*/

  socket.emit('room',{cuarto:aux});
});

})
