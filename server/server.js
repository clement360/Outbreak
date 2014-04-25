require('./pathfinding.js');
require('./conf.js');
var express  = require('express')
    , app    = express()
    , server = require('http').createServer(app)
    , io     = require('socket.io').listen(server);

var port = process.env.OPENSHIFT_NODEJS_PORT || 56644  
, ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";

server.listen(port, ip);

var userNames;
var usersReady;
var users;
var zombies;
var turrets;
var serverUp = false;
var gameStarted;

function initServer() {
	userNames = new Array();
	usersReady = new Array();
	users = new Array();

	//Zombies array is of the form [i][k]
	//Where i is player index and k is zombie index
	turrets = new Array();
	for(var i = 0; i < 4; i++) {
		turrets[i] = new Array();
	}
	
	leftStructures = [];
	rightStructures = [];
	
	leftStructures[0] = new Building(86, 283, 0, 2, baseHp);
	leftStructures[1] = new Building(86, 406, 0, 3, baseHp);
	rightStructures[0] = new Building(1820, 283, 16, 2, baseHp);
	rightStructures[1] = new Building(1820, 406, 16, 3, baseHp);
	
	//Zombies array is of the form [i][k]
	//Where i is player index and k is zombie index
	zombies = new Array();
	for(var i = 0; i < 4; i++) {
		zombies[i] = new Array();
	}
	
	for (var i = 0; i < gridWidth; i++) {
        for (var k = 1; k < gridHeight; k++) {
			serverGrid[i][k].occupied = false;
		}
	}
	
	serverGrid[0][2].occupied = true;
	serverGrid[0][3].occupied = true;
	serverGrid[16][2].occupied = true;
	serverGrid[16][3].occupied = true;
	
	gameStarted = false;
	serverUp = true;
}

//Call this once when the server boots
initServer();

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

function Turret(building, speed, attack, splash, range) {
	this.splash = splash;
	this.speed = speed;
	this.attack = attack;
	this.building = building;
	this.range = range;
}

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

function checkVictoryCondition() {
	if(!serverGrid[0][2].occupied && !serverGrid[0][3].occupied) {
		serverUp = false;
		io.sockets.emit("gameOver", {
			"winner" : "right"
		});
		console.log("Game over. Reinitializing...");
		initServer();
	} else if(!serverGrid[16][2].occupied && !serverGrid[16][3].occupied) {
		serverUp = false;
		io.sockets.emit("gameOver", {
			"winner" : "left"
		});
		console.log("Game over. Reinitializing...");
		initServer();
	}
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
			if(!serverUp) {
				clearInterval(interval);
				return;
			}
			if(zombie.dead) {
				io.sockets.emit("zombieDied", {
					"playerIndex" : zombie.playerIndex,
					"index" : zombie.index
				});
				clearInterval(interval);
				return;
			}
			zombie.targetBuilding.hp -= zombie.attack;
			var build = zombie.targetBuilding;
			var maxHealth = buildingHp;
			// if build is a base
			if((build.i == 0 && (build.k ==2 || build.k == 3))||(build.i == 16 && (build.k == 2 || build.k == 3)))
				maxHealth = baseHp;
			//percent building health
			var targetHP = (build.hp/maxHealth);
			io.sockets.emit("zombieShotFired", {
				"i" : zombie.targetBuilding.i,
				"k" : zombie.targetBuilding.k,
				"attack" : zombie.attack,
				"targetBuilding" : build,
				"maxHP" : maxHealth
			});
			if(zombie.targetBuilding.hp <= 0) {
				if(!zombie.targetBuilding.destroyed) {
					io.sockets.emit("buildingDestroyed", {
						"i" : zombie.targetBuilding.i,
						"k" : zombie.targetBuilding.k
					});
					//Free the path grid
					var centerX = serverGrid[zombie.targetBuilding.i][zombie.targetBuilding.k].x + 55.625;
					var centerY = serverGrid[zombie.targetBuilding.i][zombie.targetBuilding.k].y + 55.625;
					var pathLoc = CoordToPathGrid(centerX, centerY);
					pathGrid[pathLoc.x][pathLoc.y] = 0;
					var currentBox = serverGrid[zombie.targetBuilding.i][zombie.targetBuilding.k];
					currentBox.occupied = false;
					checkVictoryCondition();
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

function enemyZombiesInRange(zombie, range) {
	range = typeof range !== 'undefined' ? range : 300; //Default value for range is 300
	var zombiesInRange = new Array();
	if(zombie.playerIndex < 2) {
		for(var z in zombies[2]) {
			if(distance(zombie.x, zombie.y, zombies[2][z].x, zombies[2][z].y) < range && !zombies[2][z].dead)
				zombiesInRange.push(zombies[2][z]);
		}
		for(var z in zombies[3]) {
			if(distance(zombie.x, zombie.y, zombies[3][z].x, zombies[3][z].y) < range && !zombies[3][z].dead)
				zombiesInRange.push(zombies[3][z]);
		}
	} else {
		for(var z in zombies[0]) {
			if(distance(zombie.x, zombie.y, zombies[0][z].x, zombies[0][z].y) < range && !zombies[0][z].dead)
				zombiesInRange.push(zombies[0][z]);
		}
		for(var z in zombies[1]) {
			if(distance(zombie.x, zombie.y, zombies[1][z].x, zombies[1][z].y) < range && !zombies[1][z].dead)
				zombiesInRange.push(zombies[1][z]);
		}
	}
	return zombiesInRange;
}

function enemyTurretsInRange(zombie, range) {
	range = typeof range !== 'undefined' ? range : 300; //Default value for range is 300
	var turretsInRange = new Array();
	if(zombie.playerIndex < 2) {
		for(var t in turrets[2]) {
			if(distance(zombie.x, zombie.y, turrets[2][t].building.x, turrets[2][t].building.y) < range && !turrets[2][t].building.destroyed)
				turretsInRange.push(turrets[2][t]);
		}
		for(var t in turrets[3]) {
			if(distance(zombie.x, zombie.y, turrets[3][t].building.x, turrets[3][t].building.y) < range && !turrets[3][t].building.destroyed)
				turretsInRange.push(turrets[3][t]);
		}
	} else {
		for(var t in turrets[0]) {
			if(distance(zombie.x, zombie.y, turrets[0][t].building.x, turrets[0][t].building.y) < range && !turrets[0][t].building.destroyed)
				turretsInRange.push(turrets[0][t]);
		}
		for(var t in turrets[1]) {
			if(distance(zombie.x, zombie.y, turrets[1][t].building.x, turrets[1][t].building.y) < range && !turrets[1][t].building.destroyed)
				turretsInRange.push(turrets[1][t]);
		}
	}
	return turretsInRange;
}

function attackZombie(zombie) {
	var interval = setInterval(function() {
		if(!serverUp) {
			clearInterval(interval);
			return;
		}
		//Failsafe
		if(zombie.dead) {
			io.sockets.emit("zombieDied", {
				"playerIndex" : zombie.playerIndex,
				"index" : zombie.index
			});
			clearInterval(interval);
			return;
		}
		var turretsInRange = enemyTurretsInRange(zombie);
		if(turretsInRange.length > 0) {
			if(!turretsInRange[0].attacking) {
				turretsInRange[0].attacking = true;
				turretAttackZombie(turretsInRange[0], zombie);
			}
		}
		zombie.targetZombies[0].hp -= zombie.attack;
		io.sockets.emit("zombieShotFired", {
			"x" : zombie.targetZombies[0].x,
			"y" : zombie.targetZombies[0].y
		});
		if(zombie.targetZombies[0].hp <= 0) {
			clearInterval(interval);
			zombie.attackingZombie = false;
			zombie.targetZombies[0].dead = true;
			io.sockets.emit("zombieDied", {
				"playerIndex" : zombie.targetZombies[0].playerIndex,
				"index" : zombie.targetZombies[0].index
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

function turretAttackZombie(turret, zombie) {
	var zombieAlive = false;
	if(turret.splash) {
		var interval = setInterval(function() {
			if(!serverUp) {
				clearInterval(interval);
				return;
			}
			if(!turret.building.destroyed) {
				if(!turret.cooldown) {
					turret.cooldown = true;
					setTimeout(function() {
						turret.cooldown = false;
					}, turret.speed);
					var zombiesInRange = enemyZombiesInRange(turret.building, turret.range);
					for(var z in zombiesInRange) {
						if(!zombiesInRange[z].dead) {
							zombiesInRange[z].hp -= turret.attack;
							zombieAlive = true;
						}
						if(zombiesInRange[z].hp <= 0) {
							zombiesInRange[z].dead = true;
							io.sockets.emit("zombieDied", {
								"playerIndex" : zombie.playerIndex,
								"index" : zombie.index
							});
						}	
					}
					if(!zombieAlive) {
						clearInterval(interval);
						turret.attacking = false;
						return;
					} else {
						io.sockets.emit("orbShotFired", {
							"x" : turret.building.x,
							"y" : turret.building.y
						});
					}
					zombieAlive = false;
				}
			} else {
				clearInterval(interval);
				return;
			}
		}, turret.speed);
	} else {
		var interval = setInterval(function() {
			if(!serverUp) {
				clearInterval(interval);
				return;
			}
			if(!turret.building.destroyed) {
				//Make sure the turret only shoots one zombie at a time
				if(!turret.cooldown) {
					turret.cooldown = true;
					setTimeout(function() {
						turret.cooldown = false;
					}, turret.speed);
					if(distance(zombie.x, zombie.y, turret.building.x, turret.building.y) <= turret.range && zombie.hp > 0) {
						zombie.hp -= turret.attack;
						io.sockets.emit("turretShotFired", {
							"i" : turret.building.i,
							"k" : turret.building.k,
							"x" : zombie.x,
							"y" : zombie.y
						});
					}
				}
				if(zombie.hp <= 0) {
					clearInterval(interval);
					io.sockets.emit("zombieDied", {
						"playerIndex" : zombie.playerIndex,
						"index" : zombie.index
					});
					zombie.dead = true;
					turret.attacking = false;
					var nextZombies = enemyZombiesInRange(turret.building, turret.range);
					if(nextZombies.length > 0)
						turretAttackZombie(turret, nextZombies[0]);
				}
			} else {
				clearInterval(interval);
				return;
			}
		}, turret.speed);
	}
}

var iterations;
function animate(zombie){
    var speed = zombie.speed;

    var interval = setInterval(move, speed);
    function move() {
		if(!serverUp) {
			clearInterval(interval);
			return;
		}
		//Failsafe
		if(zombie.dead) {
			io.sockets.emit("zombieDied", {
				"playerIndex" : zombie.playerIndex,
				"index" : zombie.index
			});
			clearInterval(interval);
			return;
		}
		var turretsInRange = enemyTurretsInRange(zombie, turretRange);
		if(turretsInRange.length > 0) {
			for(var t in turretsInRange) {
				if(!turretsInRange[t].attacking) {
					turretsInRange[t].attacking = true;
					turretAttackZombie(turretsInRange[t], zombie);
				}
			}
		}
        zombie.iteration++;
        if (zombie.iteration >= zombie.path.length-1 && !zombie.attackingZombie){
			attackBuilding(zombie);
            clearInterval(interval);
        } else if(!zombie.attackingZombie) {
			zombie.targetZombies = enemyZombiesInRange(zombie);
			if(zombie.targetZombies.length > 0) {
				if(!zombie.targetZombies[0].dead) {
					zombie.attackingZombie = true;
					clearInterval(interval);
					var midX = (zombie.x + zombie.targetZombies[0].x)/2;
					var midY = (zombie.y + zombie.targetZombies[0].y)/2;
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
			var newX;
			var newY;
			if(zombie.path[zombie.iteration] != null) {
				newX = coorGrid[zombie.path[zombie.iteration].y][zombie.path[zombie.iteration].x].x;
				newY = coorGrid[zombie.path[zombie.iteration].y][zombie.path[zombie.iteration].x].y;
			} else {
				console.error("ERROR: Zombie move error");
				clearInterval(interval);
				return;
			}
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
}

function findPath(startX, startY, destX, destY, playerIndex, zombieIndex) {
	easystar.findPath(startX, startY, destX, destY, function( path ) {
		if (path === null) {
			console.error("ERROR: Path was not found.");
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
	socket.emit('initialData', {
		"userNames" :userNames,
		"usersReady" : usersReady,
		"gameStarted" : gameStarted
	});
	socket.on('userName', function(data) {
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
		var lobbyEmpty = true;
		for(var user in users) {
			if(users[user] != null) {
				lobbyEmpty = false;
			}
		}
		if(lobbyEmpty && gameStarted) {
			serverUp = false;
			console.log("No players in game. Reinitializing...");
			initServer();
		}
		socket.broadcast.emit('userDisconnect', myIndex);
	});
	socket.on('readyUp', function(data) {
		usersReady[data] = true;
		var everyoneReady = true;
		for(var x = 0; x < 4; ++x) {
			if(!usersReady[x]) {
				everyoneReady = false;
				break;
			}
		}
		if(everyoneReady)
			gameStarted = true;
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
		if(data["x"] != 0 && data["y"] != 0)
			pathGrid[pathLoc.x][pathLoc.y] = 1;
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
		var turret;
		if(data["name"] == "orb")
			turret = new Turret(building, orbSpeed, orbAttack, true, orbRange);
		else if(data["name"] == "turret")
			turret = new Turret(building, turretSpeed, turretAttack, false, turretRange);
		if(turret != null) {
			turret.building.playerIndex = myIndex;
			turrets[myIndex].push(turret);
			var zombies = enemyZombiesInRange(turret.building);
			if(zombies.length > 0)
				turretAttackZombie(turret, zombies[0]);
		}
		socket.broadcast.emit('buildingPlaced', {
			"index" : myIndex,
			"x" : data["x"],
			"y" : data["y"],
			"name" : data["name"]
		});
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
				console.error("ERROR: invalid newZombie name");
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
