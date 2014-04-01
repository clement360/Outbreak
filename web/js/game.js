var buildButton = new createjs.Shape();
var closeMenuButton = new createjs.Shape();  //Sergio

var loadBuildingButton = new createjs.Shape();   //Made this Global to be able to be removed later -- Sergio
var loadZombieButton = new createjs.Shape();  //Create this to separate one button intro three functional buttons that do different thing
var loadDefenseButton = new createjs.Shape();

var attackButton = new createjs.Shape();
var buildMenu;  //Made this global  --Sergio

var users = new Array();

var moneyAmountText;

var money = 1000;
var timerSecs = 30;
var timerMins = 1;

//Grid Start
var grid = new Array(17); ////Grid to be used for game  --Sergio
for (var i = 0; i < 17; i++) {
	grid[i] = new Array(6);
}

var xPlacement = 9;  //Original x placement to populate the grid.
var yPlacement = 11;  //    "    y    "

//Box class for grid
function Box(x,y) {
    this.x = x;
    this.y = y;
    this.occupied = false;
}

var grid = new Array(17);
for (var i = 0; i < 17; i++) {
	grid[i] = new Array(6);
}

grid[0][0] = new Box(9,11);

for (var i = 0; i < 17; i++) {

	if(i == 0)
		for (var k = 1; k < 6; k++) {

			yPlacement = yPlacement + 111.25;
			grid[i][k] = new Box(xPlacement, yPlacement);
								 }	
	else
	{
		for (var k = 0; k < 6; k++) 
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
	readyButton.removeEventListener("click", loadFort);
	buildButton.addEventListener("click", loadMenu);
	buildButton.graphics.beginFill("#000000").drawRect(260, 835, 137, 45);
	stage.addChild(buildButton);
	var field = new createjs.Bitmap(queue.getResult("field"));
	var lowerMenu = new createjs.Bitmap(queue.getResult("lowerMenu"));

	lowerMenu.y = 675;

	stage.addChild(field);
	stage.addChild(lowerMenu);
	
	var playerText = new createjs.Text(myIndex + 1, "bold 100px Lithos", "#fff");
	playerText.x = 100;
	playerText.y = 840;
	stage.addChild(playerText);
	
	var moneyText = new createjs.Text("Money:", "bold 80px Lithos", "#fff");
	moneyText.x = 690;
	moneyText.y = 750;
	stage.addChild(moneyText);
	
	moneyAmountText = new createjs.Text(money, "bold 80px Lithos", "#fff");
	moneyAmountText.x = 1050;
	moneyAmountText.y = 750;
	stage.addChild(moneyAmountText);
	
	timerText = new createjs.Text("1:30", "50px Lithos", "#000");
	timerText.x = 495;
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
	loadBuildingButton.addEventListener("click", loadBuilding);
	loadBuildingButton.graphics.beginFill("#0000F").drawRect(812, 229, 310, 288);
	
	loadZombieButton.graphics.beginFill("#0000F").drawRect(422, 229, 310, 288);   ////Added zombie button to build menu
	loadDefenseButton.graphics.beginFill("#0000F").drawRect(1183, 229, 310, 288);  //// "   Defense "
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
		
function loadBuilding(event){
	stage.removeChild(buildMenu); //Remove Old building menu image --Sergio
	stage.removeChild(loadBuildingButton); //Remove Old building menu image --Sergio
	stage.removeChild(loadDefenseButton); //Sergio
	stage.removeChild(loadZombieButton); //Sergio
	stage.removeChild(closeMenuButton);

	console.log("LOAD BUILDING"); 
	loadBuildingButton.removeEventListener("click", loadBuilding);
	attackButton.addEventListener("click", loadAttack);
	
	var bmp1 = new createjs.Bitmap(queue.getResult("factory1"));  /////Start Sergio code for drag and drop~!
	stage.addChild(bmp1);
	
	var offsetx = bmp1.image.width / 2;
	var offsety = bmp1.image.height / 2;
	
	var buildingMove = function(evt){   		
		bmp1.x = evt.stageX - offsetx;
		bmp1.y = evt.stageY - offsety;
	};
	
	var buildingPlace = function(evt) {
		if((evt.target.x < 500) && (evt.target.y < 300) && money >= 250) //Sets up basic primitive boundaries -- Sergio
		{
			stage.removeEventListener("stagemousemove", buildingMove);
			stage.removeEventListener("pressup", buildingPlace);
			var buildingPlaceEvt = {
				"x" : evt.target.x,
				"y" : evt.target.y
			}
			
			money -= 250;
			moneyAmountText.text = money;
			
			socket.emit("buildingPlaced", buildingPlaceEvt);
			buildButton.addEventListener("click", loadMenu);
		}
		else if (money < 250) {
			alert("You are broke.");
		} else {
			alert("Invalid location.");
		}
	};
	
	stage.addEventListener("stagemousemove", buildingMove);
	stage.addEventListener("pressup", buildingPlace);
	
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