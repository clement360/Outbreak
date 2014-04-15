//x and y correspond to pixel location
function Building(x, y, hp) {
	this.hp = hp;
	this.x = x;
	this.y = y;
}

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
				sprite.rotation = 0;
				createjs.Tween.get(sprite).to({rotation:180}, 500);
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
	}

	stage.addChild(sprite);
});

socket.on("turretShotFired", function(data) {
	createjs.Sound.play("turretShotFired");
	console.log(data);
});

socket.on("orbShotFired", function(data) {
	createjs.Sound.play("orbShotFired");
	burst(data["block"].i, data["block"].k);
	console.log("BLOCK: " +data["block"].i + " - " + data["block"].k);
});

var gameOver = false;
socket.on("buildingDestroyed", function(data) {
	createjs.Sound.play("buildingDestroyed");
	var currentBox = grid[data["i"]][data["k"]];
	explode(data["i"], data["k"]);
	currentBox.occupied = false;
	if(!grid[0][2].occupied && !grid[0][3].occupied && !gameOver) {
		if(myIndex < 2) {
			lose();
		} else {
			victory();
		}
		gameOver = true;
	} else if(!grid[16][2].occupied && !grid[16][3].occupied && !gameOver) {
		if(myIndex < 2) {
			victory();
		} else {
			lose();
		}
		gameOver = true;
	}
	currentBox.building.destroyed = true;
	if(currentBox.building.name == "bank")
		banks.splice(0, 1);
	stage.removeChild(currentBox.building.sprite);
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
				sprite.regX = 120;
				sprite.regY = 99;
				sprite.rotation = 180;
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