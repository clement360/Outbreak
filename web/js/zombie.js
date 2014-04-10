var path = [];

var zombies = new Array();
for(var i = 0; i < 4; ++i) {
	zombies[i] = new Array();
}

var attackInProgress = false;

socket.on("zombiePlaced", function(data) {
	var sprite;
	var speed;
	var hp;
	var speed;
	var attack;
	
	if(data["playerIndex"] == 0 || data["playerIndex"] == 1) {
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
	if(data["name"] == "small") {
		hp = 15;
		speed = 400;
		attack = 10;
	} else {
		hp = 60;
		speed = 600;
		attack = 55;
	}
	sprite.x = data["srcX"];
	sprite.y = data["srcY"];
	
	var index = data["index"];
	
	zombies[data["playerIndex"]].push(new Zombie(data["srcX"], data["srcY"], data["index"], sprite, hp, speed, attack));
	stage.addChild(sprite);
	
	createjs.Tween.get(sprite).to({x:data["dstX"], y:data["dstY"]}, 1000);

});

socket.on("zombieMoved", function(data) {
	zombies[data["playerIndex"]][data["index"]].x = data["x"];
	zombies[data["playerIndex"]][data["index"]].y = data["y"];
	createjs.Tween.get(zombies[data["playerIndex"]][data["index"]].sprite).to({x:data["x"], y:data["y"]}, zombies[data["playerIndex"]][data["index"]].speed);
});

function Zombie (x, y, index, sprite, hp, speed, attack) {
	this.hp = hp;
	this.speed = speed;
	this.iteration = 0;
	this.index = index;
	this.path = [];
	this.sprite = sprite;
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
			var sprite = new createjs.Bitmap(greenZombie.image);
			zombies[myIndex].push(new Zombie(xCoor, yCoor, zombies.length, sprite, 15, 400, 10));
			break;
		case "blueZombie":
			var sprite = new createjs.Bitmap(blueZombie.image);
			zombies[myIndex].push(new Zombie(xCoor, yCoor, zombies.length, sprite, 15, 400, 10));
			break;
		case "blueKing":
			var sprite = new createjs.Bitmap(blueKing.image);
			zombies[myIndex].push(new Zombie(xCoor, yCoor, zombies.length, sprite, 60, 600, 55));
			break;
		case "greenKing":
			var sprite = new createjs.Bitmap(greenKing.image);
			zombies[myIndex].push(new Zombie(xCoor, yCoor, zombies.length, sprite, 60, 600, 55));
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

function attack() {
	socket.emit("attack", myIndex);

	for(var cage in cages){
		cages[cage].available = 4;
	}
	
	usedZombieCap = 0;
	usedZombieCapText.text = usedZombieCap;
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
				
			stage.addChild(zombies[myIndex][zombies[myIndex].length-1].sprite);
			createjs.Tween.get(zombies[myIndex][zombies[myIndex].length-1].sprite).to({x:cage.x + xOffset, y:cage.y + yOffset}, 1000);
			
			socket.emit("zombiePlaced", {
				"index": zombies[myIndex][zombies[myIndex].length-1].index,
				"playerIndex" : myIndex,
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
