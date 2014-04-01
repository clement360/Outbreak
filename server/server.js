var io = require('socket.io').listen(56644);
var userNames = new Array();
var usersReady = new Array();
var users = new Array();

// A* Pathfinding Variables
// Reference: https://github.com/prettymuchbryce/easystarjs
var EasyStar = require('easystarjs');
var easystar = new EasyStar.js();

var grid = new Array(17);
for (var i = 0; i < 17; i++) {
	grid[i] = new Array(6);
}

easystar.setGrid(grid);
easystar.enableDiagonals();

function User(userName) {
    this.name = userName;
    this.ready = false;
    this.money = 0;
}


io.sockets.on('connection', function(socket) {
	var myIndex;
	socket.emit('initialData', {"userNames" :userNames, "usersReady" : usersReady});
	socket.on('userName', function(data) {
		console.log(data);
		for(var x = 0; x < 4; ++x) {
			if(userNames[x] == null) {
				userNames[x] = data;
                users[x] = new User(data);
				myIndex = x;
				break;
			}
		}
		socket.emit("index", myIndex);
		socket.broadcast.emit('newUser', {
			"userName" : data,
			"index" : myIndex
		});
	});
	socket.on('disconnect', function(data) {
		delete userNames[myIndex];
		delete usersReady[myIndex];
        delete users[myIndex];
		socket.broadcast.emit('userDisconnect', myIndex);
	});
	socket.on('readyUp', function(data) {
		usersReady[data] = true;
		socket.broadcast.emit('userReady', data);
	});

    socket.on('requestUserData', function(data) {
        socket.emit('newUserData', users);
    });

});

console.log("Server started.");
