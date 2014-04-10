var path = [];
var zombies = [];
var attackInProgress = false;
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
		if(x <= 38){
			xCoor = 0;
			break;
		}
		if(coorGrid[i][0].x <= x && coorGrid[i][0].x + 55.9 > x){
			xCoor = i;
			break;
		}
	}
	for(var j = 0; j < 12; ++j) {
		if(y <= 33){
			yCoor = 0;
			return {
				x: xCoor,
				y: yCoor
			}
		}
		if(coorGrid[xCoor][j].y <= y && coorGrid[xCoor][j].y + 56.5 > y){
			yCoor = j;
			return {
				x: xCoor,
				y: yCoor
			}
		}
	}
	console.log("coordToPathGrid Error: X: "+ x +" or Y: "+ y +" not in range.");
	return 0;
}
//coorGrid End

socket.on("zombiePlaced", function(data) {
	var sprite;
	
	if(data["index"] == 0 || data["index"] == 1) {
		if(data["name"] == "small")
			sprite = new createjs.Bitmap(queue.getResult("greenZombie"));
		else
			sprite = new createjs.Bitmap(queue.getResult("greenKing"));
	}
	else {
		if(data["name"] == "small")
			sprite = new createjs.Bitmap(queue.getResult("blueZombie"));
		else
			sprite = new createjs.Bitmap(queue.getResult("blueKing"));
	}
	sprite.x = data["srcX"];
	sprite.y = data["srcY"];
	newZombie(data["dstX"], data["dstY"], data["name"]);
	stage.addChild(sprite);
	
	createjs.Tween.get(sprite).to({x:data["dstX"], y:data["dstY"]}, 1000);

});

function Zombie (x, y, index, sprite, hp, speed, attack) {
	this.hp = hp;
	this.speed = speed;
	this.iteration = 0;
	this.index = index;
	this.path = [];
	this.sprite = new createjs.Bitmap(sprite.image);
	this.sprite.x = x; // subject to change
	this.sprite.y = y;
	this.attack = attack;
	this.target;
}

function newZombie(x, y, name){
	var xCoor = x;
	var yCoor = y;
	switch(name){
		case "greenZombie":
			zombies.push(new Zombie(xCoor, yCoor, zombies.length, greenZombie, 15, 400, 10));
			break;
		case "blueZombie":
			zombies.push(new Zombie(xCoor, yCoor, zombies.length, blueZombie, 15, 400, 10));
			break;
		case "blueKing":
			zombies.push(new Zombie(xCoor, yCoor, zombies.length, blueKing, 60, 600, 55));
			break;
		case "greenKing":
			zombies.push(new Zombie(xCoor, yCoor, zombies.length, greenKing, 60, 600, 55));
			break;
		default:
			console.log("Error: invalid newZombie name");
	}
}

function loadZombies() {
	for (var x = 0; x < 10; x++) {
		newZombie(50, 40, "blueZombie");
	}
	newZombie(50, 40, "greenKing");
	newZombie(50, 40, "blueKing");
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

function distance(x1, y1, x2, y2){
	return Math.sqrt((x2^2 - x1^2)+(y2^2 - y1^2));
}
// returns a box object containing the nearest building i and j pathGrid indices
// ex: var target = zombie[2].findNearestTarget();
// newPath(target.x - 1, target.y);
Zombie.prototype.findNearestStructure = function(){
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
		return CoordToPathGrid(rightStructures[index].x, rightStructures[index].y);
	}
	else{
		for(var j = 0; j < leftStructures.length; j++){
			dist = distance(this.x, this.y, leftStructures[j].x, leftStructures[j].y);
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

function attack() {
	var x = 31;
	var y = 7;
	var i = 0;

	loop();
	function loop() {
		setTimeout(function () {
			zombies[i].target = zombies[i].findNearestStructure();
			console.log();
			newPath(zombies[i], zombies[i].target.x, zombies[i].target.y);
			i++;
			if (i < zombies.length) {
				loop();
			}
		}, 300)
	}

	for(var cage in cages){
		cages[cage].available = 4;
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

function checkCages(king) {
	for(var cage in cages) {
		if(king) {
			if(cages[cage].available == 4)
				return cages[cage];
		}
		else if(cages[cage].available > 0)
			return cages[cage];
	}
	return null;
}

function placeZombie(price, name) {
	if(money < price) 
		gameAlert("               Alert", "\nInsufficient money.");
	else if(factories.length == 0)
		gameAlert("  Can't Build Zombie", "   You must build a\n  factory to create\n            zombies.");
	else {
		var cage = checkCages(name == "king");
		if(cage != null) {
			var factory = factories[0];
			var xOffset = 15;
			var yOffset = 10;
			switch(cage.available) {
				case 4:
					break;
				case 3:
					xOffset += 40;
					break;
				case 2:
					yOffset += 50;
					break;
				case 1:
					xOffset += 40;
					yOffset += 50;
					break;
			}

			if(name == "small")
				cage.available -= 1;
			else
				cage.available = 0;
			money -= price;
			moneyAmountText.text = money;

			if(myIndex < 2 && name == "small") {
				newZombie(factory.x, factory.y, "greenZombie");
				usedZombieCap += 1;
				usedZombieCapText.text = usedZombieCap;
			}
			else if(myIndex < 2 && name == "king") {
				newZombie(factory.x, factory.y, "greenKing");
				usedZombieCap += 4;
				usedZombieCapText.text = usedZombieCap;
			}
			else if(myIndex >= 2 && name == "small") {
				newZombie(factory.x, factory.y, "blueZombie");
				usedZombieCap += 1;
				usedZombieCapText.text = usedZombieCap;
			}
			else {
				newZombie(factory.x, factory.y, "blueKing");
				usedZombieCap += 4;
				usedZombieCapText.text = usedZombieCap;
			}
				
			stage.addChild(zombies[zombies.length-1].sprite);
			createjs.Tween.get(zombies[zombies.length-1].sprite).to({x:cage.x + xOffset, y:cage.y + yOffset}, 1000);
			
			socket.emit("zombiePlaced", {
				"index": myIndex,
				"name": name,
				"srcX": factory.x,
				"srcY": factory.y,
				"dstX": cage.x + xOffset,
				"dstY": cage.y + yOffset
			});
		} else
			gameAlert("  Can't Build Zombie", "   You do not have\n     enough zombie\n              cages.");
	}
}
