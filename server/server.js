require('./pathfinding.js');
var io = require('socket.io').listen(56644);
var userNames = new Array();
var usersReady = new Array();
var users = new Array();

//Zombies array is of the form [i][k]
//Where i is player index and k is zombie index
var zombies = new Array();
for(var i = 0; i < 4; i++) {
	zombies[i] = new Array();
}

function Zombie (x, y, index, playerIndex, hp, speed, attack) {
	this.x = x;
	this.y = y;
	this.hp = hp;
	this.speed = speed;
	this.iteration = 0;
	this.index = index;
	this.playerIndex = playerIndex;
	this.path = [];
	this.attack = attack;
	this.target;
	
	// returns a box object containing the nearest building i and j pathGrid indices
	// ex: var target = zombie[2].findNearestTarget();
	// newPath(target.x - 1, target.y);
	this.findNearestStructure = function(myIndex) {
		var shortestDistance = 2000;
		var index = 0;
		var dist;
		if(myIndex < 2){
			for(var k = 0; k < rightStructures.length; k++){
				dist = distance(this.x, this.y, rightStructures[k].x, rightStructures[k].y);
				if(dist < shortestDistance){
					index = k;
					shortestDistance = dist;
				}
			}
			this.target = CoordToPathGrid(rightStructures[index].x, rightStructures[index].y);
		}
		else{
			for(var j = 0; j < leftStructures.length; j++){
				dist = distance(this.sprite.x, this.sprite.y, leftStructures[j].x, leftStructures[j].y);
				if(dist < shortestDistance){
					index = j;
					shortestDistance = dist;
				}
			}
			this.target = CoordToPathGrid(leftStructures[index].x, leftStructures[index].y);
		}
	}
}

//x and y correspond to pixel location
function Building(x, y, hp) {
	this.hp = hp;
	this.x = x;
	this.y = y;
}

leftStructures[0] = new Building(86, 283, 500);
leftStructures[1] = new Building(86, 406, 500);
rightStructures[0] = new Building(1820, 283, 500);
rightStructures[1] = new Building(1820, 283, 500);

//-------------------------EasyStar.js-------------------------//
var EasyStar = require('easystarjs');
var easystar = new EasyStar.js();

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

setInterval(function(){
    easystar.calculate();
},100);
//-----------------------End EasyStar.js-----------------------//

function distance(x1, y1, x2, y2){
	var xDiff = x2 - x1;
	var yDiff = y2 - y1;
	var xx = xDiff * xDiff;
	var yy = yDiff * yDiff;
	return Math.sqrt(xx + yy);
}

var iterations;
function animate(zombie){
    zombie.iteration;
    var speed = zombie.speed;

    var interval = setInterval(move, speed);
    function move() {
        zombie.iteration++;
        if (zombie.iteration >= zombie.path.length-1){
            clearInterval(interval);
            //stage.removeChild(zombie);
        }
		var sss = coorGrid;
        var newX = coorGrid[zombie.path[zombie.iteration].y][zombie.path[zombie.iteration].x].x;
        var newY = coorGrid[zombie.path[zombie.iteration].y][zombie.path[zombie.iteration].x].y;
		zombie.x = newX;
		zombie.y = newY;
		io.sockets.emit("zombieMoved", {
			"x" : zombie.x,
			"y" : zombie.y,
			"index" : zombie.index,
			"playerIndex" : zombie.playerIndex
		});
    }
	zombie.iteration = 0;
	//attackInProgress = false;
}

function findPath(startX, startY, destX, destY, playerIndex, zombieIndex) {
	easystar.findPath(startX, startY, destX, destY, function( path ) {
		if (path === null) {
			console.log("Path was not found.");
		} else {
			zombies[playerIndex][zombieIndex].path.length = 0;
			zombies[playerIndex][zombieIndex].path = path;
			animate(zombies[playerIndex][zombieIndex]);
		}
	});
}

function newPath (zombie, x2, y2, playerIndex, socket){
	zombie.path.length = 0;
	var cor = CoordToPathGrid(zombie.x, zombie.y);

	// make sure target is in bounds and not current position
	if((x2 != cor.x || y2 != cor.y) && x2 <= 32 && x2 >= 0 && y2 >= 0 && y2 <= 11){
		findPath(cor.y, cor.x, y2, x2, playerIndex, zombie.index, socket);
	}
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
	socket.on("buildingPlaced", function(data) {
        serverGrid[data["x"]][data["y"]].occupied = true;
		var centerX = serverGrid[data["x"]][data["y"]].x + 55.625;
		var centerY = serverGrid[data["x"]][data["y"]].y + 55.625;
		var pathLoc = CoordToPathGrid(centerX, centerY);
		pathGrid[pathLoc.x][pathLoc.y] = 1;
        console.log("Placed X:" + data["x"] + " Y:" + data["y"]);
		var building = new Building(data["x"], data["y"], data["hp"]);
		switch(myIndex) {
			case 0:
			case 1:
				leftStructures.push(building);
				break;
			case 2:
			case 3:
				rightStructures.push(building);
					break;
		}
		socket.broadcast.emit('buildingPlaced', {
			"index" : myIndex,
			"x" : data["x"],
			"y" : data["y"],
			"name" : data["name"]
		});
	});

	socket.on("findPath", function(data) {
		
	});

	socket.on("zombiePlaced", function(data) {
		console.log(data["name"]);
		switch(data["name"]){
			case "small":
				zombies[myIndex].push(new Zombie(data["dstX"], data["dstY"], zombies[myIndex].length, myIndex, 15, 400, 10));
				break;
			case "king":
				zombies[myIndex].push(new Zombie(data["dstX"], data["dstY"], zombies[myIndex].length, myIndex, 60, 600, 55));
				break;
			default:
				console.log("Error: invalid newZombie name");
		}
		socket.broadcast.emit("zombiePlaced", data);
	});
	
	socket.on("attack", function(data) {
		var x = 31;
		var y = 7;
		var i = 0;

		loop();
		function loop() {
			setTimeout(function () {
				console.log(zombies[data].length);
				zombies[data][i].findNearestStructure(data);
				newPath(zombies[data][i], zombies[data][i].target.x, zombies[data][i].target.y, data);
				i++;
				if (i < (zombies[data].length)) {
					loop();
				}
			}, 300)
		}
	});
});

console.log("Server started.");
