var path = [];

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

function CoordToPathGrid(x, y) {
	var xCoor;
	var yCoor;
	for(var i = 0; i < 33; ++i) {
		if(coorGrid[i][0].x <= x && coorGrid[i][0].x + 55.9 > x){
			xCoor = i;
			break;
		}
	}
	for(var j = 0; j < 12; ++j) {
		if(coorGrid[xCoor][j].y <= y && coorGrid[xCoor][j].y + 56.5 > y){
			yCoor = j;
			return {
				x: xCoor,
				y: yCoor
			}
		}
	}
	console.log("coordToPathGrid Error: X or Y not in range.");
	return 0;
}
//coorGrid End

var zombies = [];

function Zombie (x, y, index){
	this.hp = 20;
	this.speed = 300;
	this.x = x; // subject to change
	this.y = y;
	this.index = index;
	this.path = [];
	this.sprite = greenZombieBmp;
}

for (var i = 0; i <= 10; i++) {
	zombies.push(Zombie(1, i, i));
}

// returns a box object containing the nearest building i and j pathGrid indices
// ex: var target = zombie[2].findNearestTarget();
// newPath(target.x - 1, target.y);
Zombie.prototype.findNearestStructure = function(){
	var shortestDistance = rightStructures[0];
	var index = 0;
	var dist;
	if(this.index == 0 || this.index == 1){
		for(var k = 1; k < rightStructures.length; k++){
			dist = distance(this.x, this.y, rightStructures[k].x, rightStructures[k].y);
			if(dist < shortestDistance){
				index = k;
				shortestDistance = dist;
			}
		}
		return CoordToPathGrid(rightStructures[index].x, rightStructures[index].y);
	}
	else{
		for(var j = 1; j < rightStructures.length; j++){
			dist = distance(this.x, this.y, rightStructures[j].x, rightStructures[j].y);
			if(dist < shortestDistance){
				index = j;
				shortestDistance = dist;
			}
		}
		return CoordToPathGrid(leftStructures[index].x, leftStructures[index].y);
	}
}

Zombie.prototype.newPath = function (x2, y2){
	this.path.length = 0;

//	if (typeof greenZombieBmp === "undefined") {
//		greenZombieBmp = new createjs.Bitmap(queue.getResult("greenZombie"));
//		greenZombieBmp.x = 40;
//		greenZombieBmp.y = 40;
//	}

	var cor = CoordToPathGrid(greenZombie.x, greenZombie.y);

	// make sure target is in bounds and not current position
	if((x2 != cor.x || y2 != cor.y) && x2 <= 32 && x2 >= 0 && y2 >= 0 && y2 <= 11){
		socket.emit('findPath',  {
			"x1" : cor.y,
			"y1" : cor.x,
			"x2" : y2,
			"y2" : x2,
			"zombieIndex" : this.index
		});
	}
}


socket.on("findPath", function(data) {
	var startX = data["x1"];
	var startY = data["y1"];
	var destX = data["x2"];
	var destY = data["y2"];
	var zombieIndex = data["zombieIndex"];
	easystar.findPath(startX, startY, destX, destY, function( path ) {
		if (path === null) {
			console.log("Path was not found.");
		} else {
			socket.emit('pathUpdate', {
				"path" : path,
				"pathIndex" : zombieIndex
			});
		}

	});
});

socket.on('pathUpdate', function(data) {
	var pathIndex = data["pathIndex"];
	zombies[pathIndex].path.length = 0;
	zombies[pathIndex].path = data;
	animate(zombies[pathIndex]);
});



var iterations;
function animate(zombie){
    iterations = 0;
    var speed = zombie.speed;

    stage.addChild(greenZombieBmp);
    var interval = setInterval(move, speed);
    function move() {
        iterations++;
        if (iterations >= zombie.path.length-1){
            clearInterval(interval);
            //stage.removeChild(zombie);
        }
        var newX = coorGrid[zombie.path[iterations].y][zombie.path[iterations].x].x;
        var newY = coorGrid[zombie.path[iterations].y][zombie.path[iterations].x].y;
        createjs.Tween.get(zombie.sprite).to({x:newX, y:newY}, speed);
		zombie.x = newX;
		zombie.y = newY;
    }

}
