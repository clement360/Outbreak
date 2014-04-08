//x and y correspond to grid location
function Building(x, y, hp) {
	this.hp = hp;
	this.x = x;
	this.y = y;
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
			sprite.x = currentBox.x;
			sprite.y = currentBox.y;
			currentBox.occupied = true;
			
			switch(name) {
				case "factory":
					factories.push(new Building(currentBox.x, currentBox.y, 100));
					break;
				case "bank":
					banks.push(new Building(currentBox.x, currentBox.y, 100));
					break;
				case "cage":
					cages.push(new Building(currentBox.x, currentBox.y, 100));
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
				"name" : name
            }

            moneyAmountText.text = money;

            socket.emit("buildingPlaced", buildingPlaceEvt);
            buildButton.addEventListener("click", loadMenu);
			/*stage.addChild(lowerMenu);
			stage.addChild(moneyText);
			stage.addChild(moneyAmountText);
			stage.addChild(playerText);
			stage.addChild(timerText);*/
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
		stage.removeChild(sprite);
		stage.removeChild(event.target);
		var spriteCopy = new createjs.Bitmap(sprite.image);
		handleBuilding(spriteCopy, name);
	}
	else {
		gameAlert("               Alert", "\nInsufficient money.");
	}
}
