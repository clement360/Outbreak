require('./pathfinding.js');
require('./conf.js');
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
	this.targetBuilding;
	
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
				if(dist < shortestDistance && !rightStructures[k].destroyed){
					index = k;
					shortestDistance = dist;
				}
			}
			this.target = CoordToPathGrid(rightStructures[index].x, rightStructures[index].y);
			this.targetBuilding = rightStructures[index];
		}
		else {
			for(var j = 0; j < leftStructures.length; j++){
				dist = distance(this.x, this.y, leftStructures[j].x, leftStructures[j].y);
				if(dist < shortestDistance && !leftStructures[j].destroyed){
					index = j;
					shortestDistance = dist;
				}
			}
			this.target = CoordToPathGrid(leftStructures[index].x, leftStructures[index].y);
			this.targetBuilding = leftStructures[index];
		}
	}
}

//x and y correspond to pixel location
function Building(x, y, i, k, hp) {
	this.hp = hp;
	this.x = x;
	this.y = y;
	this.i = i;
	this.k = k;
}

leftStructures[0] = new Building(86, 283, 0, 2, baseHp);
leftStructures[1] = new Building(86, 406, 0, 3, baseHp);
rightStructures[0] = new Building(1820, 283, 16, 2, baseHp);
rightStructures[1] = new Building(1820, 406, 16, 3, baseHp);

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
	var yDiff = x2 - x1;
	var xx = xDiff * xDiff;
	var yy = yDiff * yDiff;
	return Math.sqrt(xx + yy);
}

function attackBuilding(zombie) {
	if(zombie.dead) return;
	var structures;
	if(zombie.playerIndex < 2)
		structures = rightStructures;
	else
		structures = leftStructures;
	if(zombie.targetBuilding != null) {
		var interval = setInterval(function() {
			if(zombie.dead) {
				io.sockets.emit("zombieDied", {
					"playerIndex" : zombie.playerIndex,
					"index" : zombie.index
				});
				clearInterval(interval);
				return;
			}
			if(zombie.targetBuilding.hp > 0) {
				zombie.targetBuilding.hp -= zombie.attack;
				io.sockets.emit("zombieShotFired", {
					"i" : zombie.targetBuilding.i - 1,
					"k" : zombie.targetBuilding.k
				});
			}
			else {
				if(!zombie.targetBuilding.destroyed) {
					io.sockets.emit("buildingDestroyed", {
						"i" : zombie.targetBuilding.i,
						"k" : zombie.targetBuilding.k,
					});	
					zombie.targetBuilding.destroyed = true;
				}
				zombie.path = new Array();
				zombie.findNearestStructure(zombie.playerIndex);
				newPath(zombie, zombie.target.x, zombie.target.y, zombie.playerIndex);
				clearInterval(interval);
			}
		}, zombie.speed);
	}
	else
		console.log("ERROR: No building to attack!");
}

function enemyZombieInRange(zombie) {
	if(zombie.playerIndex < 2) {
		for(var z in zombies[2]) {
			if(Math.abs(distance(zombie.x, zombie.y, zombies[2][z].x, zombies[2][z].y)) < 300 && !zombies[2][z].dead) 
				return zombies[2][z];
		}
		for(var z in zombies[3]) {
			if(Math.abs(distance(zombie.x, zombie.y, zombies[3][z].x, zombies[3][z].y)) < 300 && !zombies[3][z].dead) 
				return zombies[3][z];
		}
	} else {
		for(var z in zombies[0]) {
			if(Math.abs(distance(zombie.x, zombie.y, zombies[0][z].x, zombies[0][z].y)) < 300 && !zombies[0][z].dead) 
				return zombies[0][z];
		}
		for(var z in zombies[1]) {
			if(Math.abs(distance(zombie.x, zombie.y, zombies[1][z].x, zombies[1][z].y)) < 300 && !zombies[1][z].dead) 
				return zombies[1][z];
		}
	}
	return null;
}

function attackZombie(zombie) {
	var interval = setInterval(function() {
		//Failsafe
		if(zombie.dead) {
			io.sockets.emit("zombieDied", {
				"playerIndex" : zombie.playerIndex,
				"index" : zombie.index
			});
			clearInterval(interval);
			return;
		}
		if(zombie.targetZombie.hp > 0) {
			zombie.targetZombie.hp -= zombie.attack;
			io.sockets.emit("zombieShotFired", {
				"x" : zombie.midPoint.x,
				"y" : zombie.midPoint.y
			});
		}
		else {
			console.log("Zombie died!!!");
			clearInterval(interval);
			zombie.attackingZombie = false;
			zombie.targetZombie.dead = true;
			io.sockets.emit("zombieDied", {
				"playerIndex" : zombie.targetZombie.playerIndex,
				"index" : zombie.targetZombie.index
			});
			if(!zombie.dead) {
				zombie.path = new Array();
				zombie.findNearestStructure(zombie.playerIndex);
				newPath(zombie, zombie.target.x, zombie.target.y, zombie.playerIndex);
			} else {
				io.sockets.emit("zombieDied", {
					"playerIndex" : zombie.playerIndex,
					"index" : zombie.index
				});
				clearInterval(interval);
			return;
			}
		}
	}, zombie.speed);
}

var iterations;
function animate(zombie){
    var speed = zombie.speed;

    var interval = setInterval(move, speed);
    function move() {
		//Failsafe
		if(zombie.dead) {
			io.sockets.emit("zombieDied", {
				"playerIndex" : zombie.playerIndex,
				"index" : zombie.index
			});
			clearInterval(interval);
			return;
		}
        zombie.iteration++;
        if (zombie.iteration >= zombie.path.length-1 && !zombie.attackingZombie){
			attackBuilding(zombie);
            clearInterval(interval);
        } else if(!zombie.attackingZombie) {
			zombie.targetZombie = enemyZombieInRange(zombie);
			if(zombie.targetZombie != null) {
				if(!zombie.targetZombie.dead) {
					console.log("I see a zombie!!!");
					zombie.attackingZombie = true;
					clearInterval(interval);
					var midX = (zombie.x + zombie.targetZombie.x)/2;
					var midY = (zombie.y + zombie.targetZombie.y)/2;
					targetZombieGrid = CoordToPathGrid(midX, midY);
					zombie.midPoint = new Box(midX, midY);
					zombie.path = new Array();
					zombie.iteration = 0;
					newPath(zombie, targetZombieGrid.x, targetZombieGrid.y, zombie.playerIndex);
					return;
				}
			}
		} else if(zombie.iteration >= zombie.path.length-1) {
			attackZombie(zombie);
			clearInterval(interval);
			return;
		}
		if(!zombie.dead) {
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
		} else return;
    }
	zombie.iteration = 0;
	//attackInProgress = false;
}

function findPath(startX, startY, destX, destY, playerIndex, zombieIndex) {
	console.log("finding path");
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
	if(zombie.path.length == 0 && !zombie.dead) {
		zombie.path.length = 0;
		var cor = CoordToPathGrid(zombie.x, zombie.y);
		// make sure target is in bounds and not current position
		if((x2 != cor.x || y2 != cor.y) && x2 <= 32 && x2 >= 0 && y2 >= 0 && y2 <= 11){
			findPath(cor.y, cor.x, y2, x2, playerIndex, zombie.index, socket);
		}
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
		var gridLoc = serverGrid[data["x"]][data["y"]];
		var building = new Building(gridLoc.x, gridLoc.y, data["x"], data["y"], data["hp"]);
		switch(myIndex) {
			case 0:
			case 1:
				building.index = leftStructures.length;
				leftStructures.push(building);
				break;
			case 2:
			case 3:
				building.index = rightStructures.length;
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
		switch(data["name"]){
			case "small":
				zombies[myIndex].push(new Zombie(data["dstX"], data["dstY"], zombies[myIndex].length, myIndex, smallZombieHp, smallZombieSpeed, smallZombieAttack));
				break;
			case "king":
				zombies[myIndex].push(new Zombie(data["dstX"], data["dstY"], zombies[myIndex].length, myIndex, kingZombieHp, kingZombieSpeed, kingZombieAttack));
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
				if(zombies[data][i] != null) {
					zombies[data][i].findNearestStructure(data);
					newPath(zombies[data][i], zombies[data][i].target.x, zombies[data][i].target.y, data);
					i++;
					if (i < (zombies[data].length)) {
						loop();
					}
				}
			}, 0)
		}
	});
});

console.log("Server started.");
