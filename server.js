//node server
var express=require('express');
var app=express();
var server=require('http').createServer(app);
var io=require('socket.io').listen(server);
var cont=1;
var contRooms=1;
var contGlobal=0;
var aux="";
//var rolGlobal="";
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

    /*if(rolAux==1)
    rolGlobal=2;
    else {
    rolGlobal=1;
  }
  contGlobal++;*/



  /*if(contGlobal==10){
  socket.to(socket.room).emit('bye');
}
else {*/
if(colAux<=7&&colAux>=1){

  var tablero=io.sockets.adapter.rooms[socket.room].board;
  col--;

  if(tablero[0][col]==0){
    for(var i=5; i>=0; i--){
      if(tablero[i][col]==0){
        tablero[i][col]=rol;
        break;
      }
    }
    col++;

    io.sockets.adapter.rooms[socket.room].board=tablero;

    console.log(tablero);
    io.sockets.adapter.rooms[socket.room].contCuarto++;

    var resp=checarGanador(io.sockets.adapter.rooms[socket.room].board);

    if(resp==0){
      if(io.sockets.adapter.rooms[socket.room].contCuarto==42){
        console.log("empate");
        io.in(socket.room).emit('draw',"Empate");
      }
      else
      io.in(socket.room).emit('move',rol,col,"El cliente "+rol+" envió "+col);

    }
    else{
      console.log("ganó: "+resp+" del juego "+socket.room);
      io.in(socket.room).emit('result',rol,col,"ganó: "+resp);
      //}

    }
  }
  else{
    console.log("perdió: "+rol);
  }


}
else{
  //persona perdio, checar
  console.log("perdió: "+rol);
  //io.in(socket.room).emit('result',rol,col,"perdió: "+rol);
  //}

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
    aux="juego"+contRooms/2;
    socket.rol=1;
  }
  else {
    aux="juego"+contRooms/2;
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

//console.log(io.sockets.adapter.rooms);

io.sockets.adapter.rooms[aux].board =
[[0,0,0,0,0,0,0],
[0,0,0,0,0,0,0],
[0,0,0,0,0,0,0],
[0,0,0,0,0,0,0],
[0,0,0,0,0,0,0],
[0,0,0,0,0,0,0]];
io.sockets.adapter.rooms[aux].rolCuarto=1;

socket.emit('getRoom',socket.rol,aux);

if(io.sockets.adapter.rooms[aux].length==2){
  io.sockets.adapter.rooms[aux].contCuarto=0;
  socket.to(socket.room).emit('ready',1);
  //io.in(socket.room).emit('ready',1);
}
});

function checarLinea(a,b,c,d) {
  //checa 4 en linea, la primera no puede ser 0
  return ((a != 0) && (a ==b) && (a == c) && (a == d));
}

function checarGanador(m) {
  //checar vertical
  for (r = 0; r < 3; r++)
  for (c = 0; c < 7; c++)
  if (checarLinea(m[r][c], m[r+1][c], m[r+2][c], m[r+3][c]))
  return m[r][c];

  //checar horizontal
  for (r = 0; r < 6; r++)
  for (c = 0; c < 4; c++)
  if (checarLinea(m[r][c], m[r][c+1], m[r][c+2], m[r][c+3]))
  return m[r][c];

  //checar diagonal de arriba a abajo
  for (r = 0; r < 3; r++)
  for (c = 0; c < 4; c++)
  if (checarLinea(m[r][c], m[r+1][c+1], m[r+2][c+2], m[r+3][c+3]))
  return m[r][c];

  //checar diagonal de abajo hacia arriba
  for (r = 3; r < 6; r++)
  for (c = 0; c < 4; c++)
  if (checarLinea(m[r][c], m[r-1][c+1], m[r-2][c+2], m[r-3][c+3]))
  return m[r][c];

  return 0;
}

})
