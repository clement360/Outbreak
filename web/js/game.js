var buildButton = new createjs.Shape();
var closeMenuButton = new createjs.Shape();  //Sergio

var loadBuildingButton = new createjs.Shape();   //Made this Global to be able to be removed later -- Sergio
var loadZombieButton = new createjs.Shape();  //Create this to separate one button intro three functional buttons that do different thing
var loadDefenseButton = new createjs.Shape();

var attackButton = new createjs.Shape();
var buildMenu;  //Made this global  --Sergio
var lowerMenu;
var zombiesMenu;
var defensesMenu;
var buildingsMenu;


var users = new Array();

var moneyAmountText;
var playerText;
var moneyText;

var money = 1000;
var timerSecs = 30;
var timerMins = 1;

//Building menu images
var factoryImage;

//Grid Start

var gridWidth = 17;
var gridHeight = 6;

var grid = new Array(gridWidth); ////Grid to be used for game  --Sergio
for (var i = 0; i < gridWidth; i++) {
	grid[i] = new Array(gridHeight);
}

var xPlacement = 9;  //Original x placement to populate the grid.
var yPlacement = 11;  //    "    y    "


var path = new Array(17);

grid[0][0] = new Box(xPlacement,yPlacement);

for (var i = 0; i < gridWidth; i++) {
	if(i == 0)
		for (var k = 1; k < gridHeight; k++) {
			yPlacement = yPlacement + 111.25;
			grid[i][k] = new Box(xPlacement, yPlacement);
		}	
	else
	{
		for (var k = 0; k < gridHeight; k++) 
		{
			if( k == 0 )
			{
				yPlacement = -100.25;
			}
				yPlacement = yPlacement + 111.25;
				grid[i][k] = new Box(xPlacement, yPlacement);
		}	
	}
	xPlacement = xPlacement + 111.25;
	yPlacement = 11;
}
//Grid End
function stageCoordToGrid(x, y) {
	for(var i = 0; i < gridWidth; ++i) {
		for(var j = 0; j < gridHeight; ++j) {
			if(grid[i][j].x <= x && grid[i][j].y <= y && grid[i][j].x + 111.25 >= x && grid[i][j].y + 100.25 >= y)
				return grid[i][j];
		}
	}
}

socket.on('pathUpdate', function(data) {
	path = data;
});


socket.on('newUserData', function(data) {
    users = data;
});

socket.on('buildingPlaced', function(data) {
	var bmp1 = new createjs.Bitmap(queue.getResult("factory1"));
	bmp1.x = data["x"];
	bmp1.y = data["y"];
	stage.addChild(bmp1);
});



function loadFort(event){
    socket.emit('requestUserData', 0);
	currentState = state["game"];
	var userName = document.getElementById("userName");
	console.log("LOAD FORT"); 
	readyButton.removeEventListener("click", readyUp);
	buildButton.addEventListener("click", loadMenu);
	buildButton.graphics.beginFill("#000000").drawRect(260, 835, 137, 45);
	stage.addChild(buildButton);
	var field = new createjs.Bitmap(queue.getResult("field"));
	lowerMenu = new createjs.Bitmap(queue.getResult("lowerMenu"));

	lowerMenu.y = 675;

	stage.addChild(field);
	stage.addChild(lowerMenu);
	
	playerText = new createjs.Text(myIndex + 1, "bold 100px Lithos", "#fff");
	playerText.x = 100;
	playerText.y = 840;
	stage.addChild(playerText);
	
	moneyText = new createjs.Text("Money:", "bold 80px Lithos", "#fff");
	moneyText.x = 705;
	moneyText.y = 750;
	stage.addChild(moneyText);
	
	moneyAmountText = new createjs.Text(money, "bold 80px Lithos", "#fff");
	moneyAmountText.x = 1065;
	moneyAmountText.y = 750;
	stage.addChild(moneyAmountText);
	
	timerText = new createjs.Text("1:30", "50px Lithos", "#000");
	timerText.x = 505;
	timerText.y = 855;
	stage.addChild(timerText);
	
	setInterval(function() {
		if(timerSecs == 0 && timerMins > 0) {
			timerSecs = 59;
			--timerMins;
		} else if (timerMins <= 0 && timerSecs <= 0) {
			timerMins = 1;
			timerSecs = 30;
			money += 250;
			moneyAmountText.text = money;
		} else {
			--timerSecs
		}
		var timerSecsText = timerSecs;
		if(timerSecs < 10)
			timerSecsText = "0" + timerSecsText;
		timerText.text = timerMins + ":" + timerSecsText;	
	}, 1000);
}
		
function loadMenu(event){
	console.log("LOAD MENU"); 
	buildButton.removeEventListener("click", loadMenu);
	loadBuildingButton.addEventListener("click", loadBuildingMenu);
	loadBuildingButton.graphics.beginFill("#0000F").drawRect(812, 229, 310, 288);
	
	loadZombieButton.graphics.beginFill("#0000F").drawRect(422, 229, 310, 288);   ////Added zombie button to build menu
    loadZombieButton.addEventListener("click", loadZombieMenu);
	loadDefenseButton.graphics.beginFill("#0000F").drawRect(1183, 229, 310, 288);  //// "   Defense "
    loadDefenseButton.addEventListener("click", loadDefenseMenu);
	closeMenuButton.graphics.beginFill("#0000F").drawRect(1548, 110, 46, 46);  //// X close button was built!!
	closeMenuButton.addEventListener("click", closeMenu); //Added button Listener to close
	
	stage.addChild(loadDefenseButton); //Sergio
	stage.addChild(loadZombieButton); //Sergio
	stage.addChild(closeMenuButton); //Sergio
	stage.addChild(loadBuildingButton);
	
	buildMenu = new createjs.Bitmap(queue.getResult("buildMenu"));  //Declared as global now  --Sergio

	buildMenu.x = 310;
	buildMenu.y = 90;

	stage.addChild(buildMenu);
}

function loadZombieMenu(event){
    loadDefenseButton.removeEventListener("click", loadDefenseMenu);
    loadZombieButton.removeEventListener("click", loadZombieMenu);
    loadBuildingButton.removeEventListener("click", loadBuildingMenu);
    closeMenuButton.removeEventListener("click", closeMenu);

    stage.removeChild(buildMenu);
    stage.removeChild(loadBuildingButton); //Remove Old building menu image --Sergio
    stage.removeChild(loadDefenseButton); //Sergio
    stage.removeChild(loadZombieButton); //Sergio
    stage.removeChild(closeMenuButton);
    stage.removeChild(attackButton);
    stage.removeChild(lowerMenu);
    stage.removeChild(lowerMenu);
    stage.removeChild(moneyAmountText);
    stage.removeChild(playerText);
    stage.removeChild(moneyText);

    zombiesMenu = new createjs.Bitmap(queue.getResult("zombiesMenu"));
    zombiesMenu.y = 659;
    stage.addChild(zombiesMenu);
}

function loadDefenseMenu(event){
    loadDefenseButton.removeEventListener("click", loadDefenseMenu);
    loadZombieButton.removeEventListener("click", loadZombieMenu);
    loadBuildingButton.removeEventListener("click", loadBuildingMenu);
    closeMenuButton.removeEventListener("click", closeMenu);

    stage.removeChild(buildMenu); //Remove Old building menu image --Sergio
    stage.removeChild(loadBuildingButton); //Remove Old building menu image --Sergio
    stage.removeChild(loadDefenseButton); //Sergio
    stage.removeChild(loadZombieButton); //Sergio
    stage.removeChild(closeMenuButton);
    stage.removeChild(attackButton);
    stage.removeChild(lowerMenu);
    stage.removeChild(moneyAmountText);
    stage.removeChild(playerText);
    stage.removeChild(moneyText);

    defensesMenu = new createjs.Bitmap(queue.getResult("defensesMenu"));
    defensesMenu.y = 659;
    stage.addChild(defensesMenu);
}
	
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

function handleBuilding(sprite) {
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
				highlight.graphics.beginFill("#0f0").drawRect(currentBox.x, currentBox.y, 111.25, 100.25);
			else
				highlight.graphics.beginFill("#f00").drawRect(currentBox.x, currentBox.y, 111.25, 100.25);
		}
		sprite.x = evt.stageX - offsetx;
		sprite.y = evt.stageY - offsety;
	};

    var buildingPlace = function(evt) {
		var currentBox = stageCoordToGrid(evt.stageX, evt.stageY);
        if(locationIsValid(evt.stageX, evt.stageY) && money >= 250 && !currentBox.occupied) //Sets up basic primitive boundaries -- Sergio
        {
			sprite.x = currentBox.x;
			sprite.y = currentBox.y;
			currentBox.occupied = true;
			stage.removeChild(highlight);
            stage.removeEventListener("stagemousemove", buildingMove);
            stage.removeEventListener("pressup", buildingPlace);
            var buildingPlaceEvt = {
				"x" : currentBox.x,
                "y" : currentBox.y
            }

            money -= 250;
            moneyAmountText.text = money;

            socket.emit("buildingPlaced", buildingPlaceEvt);
            buildButton.addEventListener("click", loadMenu);
			stage.removeChild(buildingsMenu);
			stage.addChild(lowerMenu);
			stage.addChild(moneyText);
			stage.addChild(moneyAmountText);
			stage.addChild(playerText);
			stage.addChild(timerText);
        }
        else {
			gameAlert("               Alert", "\n  Invalid location.");
        }
    };
	
	stage.addEventListener("stagemousemove", buildingMove);
	
}

function gameAlert(title, text) {
	var alertBg = new createjs.Bitmap(queue.getResult("noticeBox"));
	var alertText = new createjs.Text(text, "bold 50px Lithos", "#fff");
	var alertTitle = new createjs.Text(title, "bold 50px Lithos", "#fff");
	alertTitle.x = 643;
	alertTitle.y = 270;
	alertText.x = 650;
	alertText.y = 370;
	alertBg.x = 643;
	alertBg.y = 265;
	alertBg.alpha = 0;
	alertText.alpha = 0;
	alertTitle.alpha = 0;
	stage.addChild(alertBg);
	stage.addChild(alertText);
	stage.addChild(alertTitle);
	createjs.Tween.get(alertBg).to({alpha:1}, 500);
	createjs.Tween.get(alertText).to({alpha:1}, 500);
	createjs.Tween.get(alertTitle).to({alpha:1}, 500);
	setTimeout(function() {
		createjs.Tween.get(alertBg).to({alpha:0}, 500);
		createjs.Tween.get(alertText).to({alpha:0}, 500);
		createjs.Tween.get(alertTitle).to({alpha:0}, 500);
		setTimeout(function() {
			stage.removeChild(alertBg);
			stage.removeChild(alertText);
			stage.removeChild(alertTitle);
		}, 500);
	}, 2000)
}

function placeFactory(event) {
	if (money >= 250) {
		stage.removeChild(factoryImage);
		stage.removeChild(event.target);
		var factorySprite = new createjs.Bitmap(queue.getResult("factory1"));
		handleBuilding(factorySprite);
	}
	else {
		gameAlert("               Alert", "\nInsufficient money.");
	}
}
	
function loadBuildingMenu(event){
    loadDefenseButton.removeEventListener("click", loadDefenseMenu);
    loadZombieButton.removeEventListener("click", loadZombieMenu);
    loadBuildingButton.removeEventListener("click", loadBuildingMenu);
    closeMenuButton.removeEventListener("click", closeMenu);

	stage.removeChild(buildMenu); //Remove Old building menu image --Sergio
	stage.removeChild(loadBuildingButton); //Remove Old building menu image --Sergio
	stage.removeChild(loadDefenseButton); //Sergio
	stage.removeChild(loadZombieButton); //Sergio
    stage.removeChild(closeMenuButton);
    stage.removeChild(lowerMenu);
    stage.removeChild(moneyAmountText);
    stage.removeChild(playerText);
    stage.removeChild(moneyText);

	console.log("LOAD BUILDING"); 

	//attackButton.addEventListener("click", loadAttack);

    buildingsMenu = new createjs.Bitmap(queue.getResult("buildingsMenu"));
    buildingsMenu.y = 659;
	
	var factoryButton = new createjs.Shape();
	factoryButton.graphics.beginFill("#000000").drawRect(350, 740, 235, 225);
	factoryButton.addEventListener("click", placeFactory);
	factoryButton.alpha = 0.01;
	
	factoryImage = new createjs.Bitmap(queue.getResult("factory1"))
	factoryImage.x = 400;
	factoryImage.y = 800;
	
	stage.addChild(factoryButton);
	stage.addChild(buildingsMenu);
	stage.addChild(factoryImage);
	
	attackButton.graphics.beginFill("#000000").drawRect(260, 906, 147, 55);
	stage.addChild(attackButton);
	attackButton.alpha = 0.01;
}

function closeMenu(even){
////-----------------------Dont forget to REMOVE LISTENERS!!!!!!!! -----Sergio
		stage.removeChild(buildMenu); //Remove Old building menu image --Sergio
		stage.removeChild(loadBuildingButton); //Remove Old building menu image --Sergio
		stage.removeChild(loadDefenseButton); //Sergio
		stage.removeChild(loadZombieButton); //Sergio
		stage.removeChild(closeMenuButton);

		loadBuildingButton.removeEventListener("click", loadBuilding);
		closeMenuButton.removeEventListener("click", closeMenu);
}

function loadAttack(event){
	console.log("LOAD ATTACK"); 
	loadBuildingButton.removeEventListener("click", loadAttack);
	buildButton.addEventListener("click", loadMenu);
	var bmp = new createjs.Bitmap(queue.getResult("battle"));
	bmp.alpha = 0.5;
	stage.addChild(bmp);
}

function tick(event){
    stage.update();
}