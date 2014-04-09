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

function Zombie (x, y, index, sprite){
	this.hp = 20;
	this.speed = 300;
	this.iteration = 0;
	this.index = index;
	this.path = [];
	this.sprite = new createjs.Bitmap(sprite.image);;
	this.sprite.x = x; // subject to change
	this.sprite.y = y;
	this.sprite.alpha = .7;
}

zombies = [];
function loadZombies() {
	for (var x = 0; x < 10; x++) {
		zombies.push(new Zombie(50, 98 * x, x, greenZombie));
	}
}


function newPath (zombie, x2, y2){
	zombie.path.length = 0;
	var cor = CoordToPathGrid(zombie.sprite.x, zombie.sprite.y);

	// make sure target is in bounds and not current position
	if((x2 != cor.x || y2 != cor.y) && x2 <= 32 && x2 >= 0 && y2 >= 0 && y2 <= 11){
		socket.emit('findPath',  {
			"x1" : cor.y,
			"y1" : cor.x,
			"x2" : y2,
			"y2" : x2,
			"zombieIndex" : zombie.index
		});
	}
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

socket.on('pathUpdate', function(data) {
	var pathIndex = data["pathIndex"];
	zombies[pathIndex].path.length = 0;
	zombies[pathIndex].path = data["path"];
	animate(zombies[pathIndex]);
});

function attack(){
	for(var x = 0; x < zombies.length-1; x++){
		newPath(zombies[x], 32, x);
	}
}

var iterations;
function animate(zombie){
    zombie.iteration;
    var speed = zombie.speed;

    stage.addChild(zombie.sprite);
    var interval = setInterval(move, speed);
    function move() {
        zombie.iteration++;
        if (zombie.iteration >= zombie.path.length-1){
            clearInterval(interval);
            //stage.removeChild(zombie);
        }
        var newX = coorGrid[zombie.path[zombie.iteration].y][zombie.path[zombie.iteration].x].x;
        var newY = coorGrid[zombie.path[zombie.iteration].y][zombie.path[zombie.iteration].x].y;
        createjs.Tween.get(zombie.sprite).to({x:newX, y:newY}, speed);
		zombie.x = newX;
		zombie.y = newY;
    }
	zombie.iteration = 0;
}
