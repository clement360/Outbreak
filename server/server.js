var io = require('socket.io').listen(56644);
var userNames = new Array();
var usersReady = new Array();
var users = new Array();
var EasyStar = require('easystarjs');
var easystar = new EasyStar.js();

//User Class
function User(userName) {
    this.name = userName;
    this.ready = false;
    this.money = 0;
}

function Box(x,y) {
    this.x = x;
    this.y = y;
    this.occupied = false;
}

// coorGrid is used as reference when converting
// pixels to pathGrid Coordinates
var coorGrid = new Array(33);
for (var i = 0; i <= 32; i++) {
    coorGrid[i] = new Array(12);
}
coorGrid[0][0] = new Box(38,33);
var xPlacement = 38;  //Original x placement to populate the grid.
var yPlacement = 33;
for (var i = 0; i < 33; i++) {
    if(i == 0)
        for (var k = 1; k < 12; k++) {

            yPlacement = yPlacement + 56.5;
            coorGrid[i][k] = new Box(xPlacement, yPlacement);
        }
    else
    {
        for (var k = 0; k < 12; k++)
        {
            if( k == 0 )
            {
                yPlacement = -23.5;
            }
            yPlacement = yPlacement + 56.5;
            coorGrid[i][k] = new Box(xPlacement, yPlacement);
        }
    }
    xPlacement = xPlacement + 55.9;
    yPlacement = 33;
}
//coorGrid End



// grid that is used for pathfinding with EasyStar 33 x 12
var pathGrid = new Array(32);
for (var i = 0; i <= 32; i++) {
    pathGrid[i] = new Array(12);
    for(var j = 0; j <= 11; j++){
        pathGrid[i][j] = 0;
    }
}

easystar.setGrid(pathGrid);
easystar.enableDiagonals();
easystar.setAcceptableTiles([0]);

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
	socket.on("buildingPlaced", function(data) {
		socket.broadcast.emit('buildingPlaced', {
			"index" : myIndex,
			"x" : data["x"],
			"y" : data["y"]
		});
	});

    socket.on("findPath", function(data) {
        var startX = data["x1"];
        var startY = data["y1"];
        var destX = data["x2"];
        var destY = data["y2"];
        easystar.findPath(startX, startY, destX, destY, function( path ) {
            if (path === null) {
                console.log("Path was not found.");
            } else {
                socket.emit('pathUpdate', path);
            }
        });
    });


    setInterval(function(){
        easystar.calculate();
    },100);
});

console.log("Server started.");
