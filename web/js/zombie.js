var zombie;
var path = [];

function Zombie (index){
	this.hp = 20;
	this.speed = 300;
	this.x = 0; // subject to change
	this.y = 0;
	this.index = index;
}

// returns a box object containing the nearest building i and j pathGrid indices
// ex: var target = zombie2.findNearestTarget();
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

socket.on('pathUpdate', function(data) {
    path = data;
    animate();
});

function newPath(x2, y2){
    path.length = 0;

    if (typeof zombie === "undefined") {
        zombie = new createjs.Bitmap(queue.getResult("greenZombie"));
        zombie.x = 40;
        zombie.y = 40;
    }

    var cor = CoordToPathGrid(zombie.x, zombie.y);

    // make sure target is in bounds and not current position
    if((x2 != cor.x || y2 != cor.y) && x2 <= 32 && x2 >= 0 && y2 >= 0 && y2 <= 11){
        socket.emit('findPath',  {

            "x1" : cor.y,
            "y1" : cor.x,
            "x2" : y2,
            "y2" : x2
        });
    }
}

var iterations;
function animate(){
    iterations = 0;
    var speed = 300;
    //zombie.x = coorGrid[path[iterations].y][path[iterations].x].x;
    //zombie.y = coorGrid[path[iterations].y][path[iterations].x].y;
    stage.addChild(zombie);
    var interval = setInterval(move, speed);
    function move() {
        iterations++;
        if (iterations >= path.length-1){
            clearInterval(interval);
            //stage.removeChild(zombie);
        }
        var newX = coorGrid[path[iterations].y][path[iterations].x].x;
        var newY = coorGrid[path[iterations].y][path[iterations].x].y;
        createjs.Tween.get(zombie).to({x:newX, y:newY}, speed);
    }

}
