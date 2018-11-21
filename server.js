//node server
var express=require('express');
var app=express();
var server=require('http').createServer(app);
var io=require('socket.io').listen(server);
var cont=1;
var contRooms=1;
var contGlobal=0;
var aux="";
var rolGlobal="";
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
  if(cont==3)
  cont=1;

  console.log('conectado el '+socket.username+': hay %s',connections.length);

  //desconexión
  socket.on('disconnect',function(data){
    aux=socket.username;
    socket.leave(socket.room);
    socket.to(socket.room).emit('bye');
    connections.splice(connections.indexOf(socket),1);
    console.log('desconectado el '+aux+': hay %s',connections.length);
  })

  socket.on('play',function(rol,col){
    //io.sockets.emit('new message',{msg:data});
    //console.log("entro el play");
    console.log(rol+" "+col);
    //console.log(data);
    var rolAux=rol;
    var colAux=col;
    //io.sockets.emit('res',"hola andrea");

    //var board=io.sockets.adapter.rooms[socket.room].board;
    //console.log(io.sockets.adapter.rooms[socket.room].board);

    if(rolAux==1)
    rolGlobal=2;
    else {
      rolGlobal=1;
    }
    contGlobal++;

    if(contGlobal==10){
      socket.to(socket.room).emit('bye');
    }
    else {
      if(colAux<=7&&colAux>=1){
        if(chkWinner(io.sockets.adapter.rooms[socket.room].board)==0)
      io.in(socket.room).emit('move',rol,col,"El cliente "+rol+" envió "+col);
    }

  }


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

    //console.log("cuarto para "+socket.rol);

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
    rolGlobal=1;
    socket.to(socket.room).emit('ready',rolGlobal);
    //io.in(socket.room).emit('ready',1);
  }
});

function chkLine(a,b,c,d) {
    // Check first cell non-zero and all cells match
    return ((a != 0) && (a ==b) && (a == c) && (a == d));
}

function chkWinner(bd) {
    // Check down
    for (r = 0; r < 3; r++)
        for (c = 0; c < 7; c++)
            if (chkLine(bd[r][c], bd[r+1][c], bd[r+2][c], bd[r+3][c]))
                return bd[r][c];

    // Check right
    for (r = 0; r < 6; r++)
        for (c = 0; c < 4; c++)
            if (chkLine(bd[r][c], bd[r][c+1], bd[r][c+2], bd[r][c+3]))
                return bd[r][c];

    // Check down-right
    for (r = 0; r < 3; r++)
        for (c = 0; c < 4; c++)
            if (chkLine(bd[r][c], bd[r+1][c+1], bd[r+2][c+2], bd[r+3][c+3]))
                return bd[r][c];

    // Check down-left
    for (r = 3; r < 6; r++)
        for (c = 0; c < 4; c++)
            if (chkLine(bd[r][c], bd[r-1][c+1], bd[r-2][c+2], bd[r-3][c+3]))
                return bd[r][c];

    return 0;
}

})
