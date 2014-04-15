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
		if(data["name"] == "small") {
			sprite = new createjs.Bitmap(queue.getResult("greenZombie"));
			createjs.Sound.play("smallZombiePlaced");
		}
		else {
			sprite = new createjs.Bitmap(queue.getResult("greenKing"));
			createjs.Sound.play("kingZombiePlaced");
		}
	}
	else {
		if(data["name"] == "small") {
			sprite = new createjs.Bitmap(queue.getResult("blueZombie"));
			sprite.regX = 33;
			sprite.regY = 29;
			sprite.rotation = 180;
			createjs.Sound.play("smallZombiePlaced");
		}
		else {
			sprite = new createjs.Bitmap(queue.getResult("blueKing"));
			sprite.regX = 84;
			sprite.regY = 89;
			sprite.rotation = 180;
			createjs.Sound.play("kingZombiePlaced");
		}
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
	var deltaY = data["y"] - zombies[data["playerIndex"]][data["index"]].y;
	var deltaX = data["x"] - zombies[data["playerIndex"]][data["index"]].x;

	var angleInDegrees = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
	createjs.Tween.get(zombies[data["playerIndex"]][data["index"]].sprite).to({rotation:angleInDegrees}, 300);

	zombies[data["playerIndex"]][data["index"]].x = data["x"];
	zombies[data["playerIndex"]][data["index"]].y = data["y"];
	createjs.Tween.get(zombies[data["playerIndex"]][data["index"]].sprite).to({x:data["x"], y:data["y"]}, zombies[data["playerIndex"]][data["index"]].speed);
});

socket.on("zombieShotFired", function(data) {
	createjs.Sound.play("zombieAttack");
	//if(data["x"] == null && data["y"] == null) {
		explode(data["i"], data["k"]);
		if(data["i"] == 15 && (data["k"] == 2 || data["k"] == 3)) {
			rightTeamHP -= data["attack"];
		}
		else if(data["i"] == -1 && (data["k"] == 2 || data["k"] == 3)) {
			leftTeamHP -= data["attack"];
		}
		if(myIndex < 2)
			scaleBar(leftTeamHP,rightTeamHP);
		else
			scaleBar(rightTeamHP,leftTeamHP);
});

socket.on("zombieDied", function(data) {
	createjs.Sound.play("zombieDied");
	zombies[data["playerIndex"]][data["index"]].dead = true;
	stage.removeChild(zombies[data["playerIndex"]][data["index"]].sprite);
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
			zombies[myIndex].push(new Zombie(xCoor, yCoor, zombies.length, sprite, smallZombieHp, smallZombieSpeed, smallZombieAttack));
			break;
		case "blueZombie":
			var sprite = new createjs.Bitmap(blueZombie.image);
			sprite.regX = 33;
			sprite.regY = 29;
			sprite.rotation = 180;
			zombies[myIndex].push(new Zombie(xCoor, yCoor, zombies.length, sprite, smallZombieHp, smallZombieSpeed, smallZombieAttack));
			break;
		case "blueKing":
			var sprite = new createjs.Bitmap(blueKing.image);
			sprite.regX = 84;
			sprite.regY = 89;
			sprite.rotation = 180;
			zombies[myIndex].push(new Zombie(xCoor, yCoor, zombies.length, sprite, kingZombieHp, kingZombieSpeed, kingZombieAttack));
			break;
		case "greenKing":
			var sprite = new createjs.Bitmap(greenKing.image);
			zombies[myIndex].push(new Zombie(xCoor, yCoor, zombies.length, sprite, kingZombieHp, kingZombieSpeed, kingZombieAttack));
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
	if(userName.value == "dragonforce")
		createjs.Sound.play("flames");
	for(var cage in cages){
		cages[cage].available = 4;
	}
	
	usedZombieCap = 0;
	usedZombieCapText.text = usedZombieCap;
}


function checkCages(king) {
	for(var cage in cages) {
		if(king) {
			if(cages[cage].available == 4 && !cages[cage].destroyed)
				return cages[cage];
		}
		else if(cages[cage].available > 0 && !cages[cage].destroyed)
			return cages[cage];
	}
	return null;
}

function placeZombie(price, name) {
	var numFactories = 0;
	for(var factory in factories) {
		if(!factories[factory].destroyed)
			++numFactories;
	}
	if(money < price) 
		gameAlert("               Alert", "\nInsufficient money.");
	else if(numFactories == 0)
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

			if(name == "small") {
				cage.available -= 1;
				createjs.Sound.play("smallZombiePlaced");
			}	
			else {
				cage.available = 0;
				createjs.Sound.play("kingZombiePlaced");
			}
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
