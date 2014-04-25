//x and y correspond to pixel location
function Building(x, y, hp) {
	this.hp = hp;
	this.x = x;
	this.y = y;
	this.healthBar = new createjs.Bitmap(queue.getResult("smallRedHealth"));
	this.healthBar.alpha = .8;
	this.healthBar.scaleX = 0;
	this.healthBar.x = x + 17;
	this.healthBar.y = y + 2;
	this.healthBase = new createjs.Bitmap(queue.getResult("smallHealthBase"));
	this.healthBase.x = x + 15;
	this.healthBase.y = y;
}

socket.on("buildingDamaged", function(data) {
	if(!isBase(data["i"], data["k"])) {
		var myBuild = findBuilding(data["i"], data["k"]);
		var remaining = data["hp"] / data["maxHP"];
		createjs.Tween.get(myBuild.healthBar).to({scaleX: remaining}, 300);
	}
});

socket.on('buildingPlaced', function(data) {
	createjs.Sound.play("buildingPlaced");
	var sprite;
	switch(data["name"]) {
		case "factory":
			sprite = new createjs.Bitmap(queue.getResult("factory"));
			break;
		case "bank":
			sprite = new createjs.Bitmap(queue.getResult("bank"));
			break;
		case "cage":
			sprite = new createjs.Bitmap(queue.getResult("cage"));
			break;
		case "turret":
			sprite = new createjs.Bitmap(queue.getResult("turret"));
			if (data["x"] > 5){
				sprite.regX = 49;
				sprite.regY = 49;
				sprite.rotation = -180;
			}
			break;
		case "orb":
			sprite = new createjs.Bitmap(queue.getResult("orb"));
			break;
	}
	var currentBox = grid[data["x"]][data["y"]];
	sprite.x = currentBox.x;
	sprite.y = currentBox.y;

	var building = new Building(currentBox.x, currentBox.y, 100);
	building.sprite = sprite;
	currentBox.building = building;
	currentBox.occupied = true;


	
	if(data["x"] > 5 && data["name"] == "turret"){
		sprite.x += 65;
		sprite.y += 49;
		sprite.readyToRotate = true;
	}

	stage.addChild(sprite);
	stage.addChild(building.healthBase);
	stage.addChild(building.healthBar);
	createjs.Tween.get(building.healthBar).to({scaleX:1},1760);
});

socket.on("turretShotFired", function(data) {
	createjs.Sound.play("turretShotFired");
	rotateToPoint(grid[data["i"]][data["k"]].building.sprite, data["x"], data["y"], 49, 49, true);
	
	var laser = new createjs.Bitmap(queue.getResult("bullet"));
	laser.rotation = grid[data["i"]][data["k"]].building.sprite.rotation;
	laser.regX = laser.image.width / 2;
	laser.regY = laser.image.height / 2;
	laser.x = grid[data["i"]][data["k"]].building.x + 65;
	laser.y = grid[data["i"]][data["k"]].building.y + 49;
	laser.alpha = 0.8;
	
	stage.addChild(laser);
	createjs.Tween.get(laser).to({x:data["x"], y:data["y"]}, 300).call(fadeLaser);
	function fadeLaser() {
		createjs.Tween.get(laser).to({alpha:0}, 300).call(removeLaser);
	}
	function removeLaser() {
		stage.removeChild(laser);
	}
});

socket.on("orbShotFired", function(data) {
	createjs.Sound.play("orbShotFired");
	burst(data["x"], data["y"]);
});

var gameOver = false;
socket.on("gameOver", function(data) {
	if(!gameOver) {
		if((data["winner"] == "left" && myIndex < 2) || (data["winner"] == "right" && myIndex >= 2)) {
			victory();
		} else if((data["winner"] == "left" && myIndex >= 2) || (data["winner"] == "right" && myIndex < 2)) {
			lose();
		} else {
			console.error("ERROR: Invalid victory condition.");
		}
		gameOver = true;
		socket.disconnect();
	}
});

socket.on("buildingDestroyed", function(data) {
	createjs.Sound.play("buildingDestroyed");
	var currentBox = grid[data["i"]][data["k"]];
	explode(currentBox.x, currentBox.y, 4, 1500);
	currentBox.occupied = false;
	currentBox.building.destroyed = true;
	if(currentBox.building.name == "bank")
		banks.splice(0, 1);
	else if(currentBox.building.name == "cage") {
		totalcap -= 4;
		zombieCapText.text = totalcap;
	}
	stage.removeChild(currentBox.building.sprite);
	stage.removeChild(currentBox.building.healthBar);
	stage.removeChild(currentBox.building.healthBase);
});

function locationIsValid(x, y) {
	switch(myIndex) {
		case 0:
			return (x < 565.25) && (y < 340);
		case 1:
			return (x < 565.25) && (y >= 340);
		case 2:
			return (x > 1343) && (y < 340);
		case 3:
			return (x > 1343) && (y >= 340);
		default:
			return false;
	}
}

function handleBuilding(sprite, name) {
	stage.addChild(sprite);
	var offsetx = sprite.image.width / 2;
	var offsety = sprite.image.height / 2;
	
	var evtListener = false;
	var highlight = new createjs.Shape();
	highlight.alpha = 0.4;
	stage.addChild(highlight);
	
	var buildingMove = function(evt){ 
		if(!evtListener) {
			stage.addEventListener("pressup", buildingPlace);
			evtListener = true;
		}
		var currentBox = stageCoordToGrid(evt.stageX, evt.stageY);
		highlight.graphics.clear();
		
		if(currentBox != null) {
			if(locationIsValid(evt.stageX, evt.stageY) && !currentBox.occupied) 
				highlight.graphics.beginFill("#0f0").drawRect(currentBox.x + 10, currentBox.y + 7, 111.25, 105.25);
			else
				highlight.graphics.beginFill("#f00").drawRect(currentBox.x + 10, currentBox.y + 7, 111.25, 105.25);
		}
		sprite.x = evt.stageX - offsetx;
		sprite.y = evt.stageY - offsety;
	};

    var buildingPlace = function(evt) {
		var currentBox = stageCoordToGrid(evt.stageX, evt.stageY);
        if(locationIsValid(evt.stageX, evt.stageY) && !currentBox.occupied) //Sets up basic primitive boundaries -- Sergio
        {
			createjs.Sound.play("buildingPlaced");
			sprite.x = currentBox.x;
			sprite.y = currentBox.y;
			
			var building = new Building(currentBox.x, currentBox.y, buildingHp);
			building.sprite = sprite;
			building.name = name;
			stage.addChild(building.healthBase);
			stage.addChild(building.healthBar);
			createjs.Tween.get(building.healthBar).to({scaleX:1},1760);
			
			currentBox.occupied = true;
			currentBox.building = building;
			
			switch(name) {
				case "factory":
					factories.push(building);
					break;
				case "bank":
					banks.push(building);
					break;
				case "cage":
					building.available = 4;
					cages.push(building);
					cageTotal = cageTotal + 1;
					totalcap = cageTotal*4;
					zombieCapText.text = totalcap;
					break;
			}
			
			if (name == "turret" && currentBox.i > 5){
				sprite.regX = 49;
				sprite.regY = 49;
				sprite.x += 65;
				sprite.y += 49;
				sprite.readyToRotate = true;
				sprite.rotation = -180;
			}

			stage.removeChild(highlight);
            stage.removeEventListener("stagemousemove", buildingMove);
            stage.removeEventListener("pressup", buildingPlace);
            var buildingPlaceEvt = {
				"x" : currentBox.i,
                "y" : currentBox.k,
				"name" : name,
				"hp" : buildingHp
            }

            moneyAmountText.text = money;
			
            socket.emit("buildingPlaced", buildingPlaceEvt);
            buildButton.addEventListener("click", loadMenu);
        }
        else {
			gameAlert("               Alert", "\n  Invalid location.");
        }
    };
	
	stage.addEventListener("stagemousemove", buildingMove);
	
}

function placeBuilding(event, price, sprite, name) {
	if (money >= price) {
		money -= price;
		var spriteCopy = new createjs.Bitmap(sprite.image);
		handleBuilding(spriteCopy, name);
	}
	else {
		gameAlert("               Alert", "\nInsufficient money.");
	}
}
