var io = require('socket.io').listen(56644);
var userNames = new Array();
var usersReady = new Array();

io.sockets.on('connection', function(socket) {
	var myIndex;
	socket.emit('userLobby', userNames);
	socket.emit('usersReady', usersReady);
	socket.on('userName', function(data) {
		console.log(data);
		socket.broadcast.emit('newUser', data);
		for(var x = 0; x < 4; ++x) {
		if(userNames[x] == null) {
			userNames[x] = data;
			myIndex = x;
			break;
		}
	}
	});
	socket.on('disconnect', function(data) {
		delete userNames[myIndex];
		socket.broadcast.emit('userDisconnect', myIndex);
	});
	socket.on('readyUp', function(data) {
		usersReady[data] = true;
		socket.broadcast.emit('userReady', data);
	});
});

console.log("Server started.");
