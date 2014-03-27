var io = require('socket.io').listen(56644);
var userNames = new Array();

io.sockets.on('connection', function(socket) {
	var myIndex;
	socket.emit('userLobby', userNames);
	socket.on('userName', function(data) {
		console.log(data);
		socket.broadcast.emit('newUser', data);
		for(var x = 0; x < 4; ++x) {
		if(userNames[x] == null) {
			userNames[x] = data;
			break;
		}
	}
		myIndex = userNames.length - 1;
	});
	socket.on('disconnect', function(data) {
		console.log("DISCONNECTED!!!!!");
		console.log(data);
		delete userNames[myIndex];
		socket.broadcast.emit('userDisconnect', myIndex);
	});
});

console.log("Server started.");
