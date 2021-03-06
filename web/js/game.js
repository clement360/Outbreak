//Buttons
var buildButton = new createjs.Shape();
var closeBuildMenuButton = new createjs.Shape();  //Sergio
var loadBuildingButton = new createjs.Shape();   //Made this Global to be able to be removed later -- Sergio
var loadZombieButton = new createjs.Shape();  //Create this to separate one button intro three functional buttons that do different thing
var loadDefenseButton = new createjs.Shape();
var attackButton = new createjs.Shape();

//Menu images
var buildMenu;
var lowerMenu;
var zombiesMenu;
var defensesMenu;
var buildingsMenu;
var doneButton;
var blackBox;

//Menu icons
var cage;
var turret;
var orb;
var leftBase;
var rightBase;
var bank;

var users = new Array();

//Money
var moneyAmountText;
var playerText;
var moneyText;

//Health
var teamHealthCover
var enemyHealthCover
var rightTeamHP = 2*baseHp;
var leftTeamHP = 2*baseHp;

//Stats
var kingZombieAttackStat;
var kingZombieHpStat;
var kingZombieSpeedStat;

var turretHpStat;
var turretSpeedStat;
var turretAttackStat;

var orbHpStat;
var orbSpeedStat;
var orbAttackStat;

//Zombie Quantity Trackers
var totalcap = 0;
var cageTotal = 0;
var zombieTotal = 0;
var usedZombieCap = 0;

//Building menu images
var factoryImage;
var bank;
var cage;

//Building menu buttons
var factoryButton;
var bankButton;
var cageButton;

//settingsMenu
var fps30;
var fps45;
var fps60;
var soundOnBmp;
var soundOffBmp;
var settingsMenu;
var settingsButton = new createjs.Shape();
var closeSettings = new createjs.Shape();
var quitGame = new createjs.Shape();
var fpsButton30 = new createjs.Shape();
var fpsButton45 =  new createjs.Shape();
var fpsButton60 = new createjs.Shape();
var soundOnButton = new createjs.Shape();
var soundOffButton = new createjs.Shape();
var fps;
var soundOn;
var prevFPS;
var prevSound;


//Zombie menu buttons
var smallZombieButton;
var kingZombieButton;

//Grid Start
var gridWidth = 17;
var gridHeight = 6;

//Building arrays
var factories = new Array();
var banks = new Array();
var cages = new Array();

//Placement grid
var grid = new Array(gridWidth);
for (var i = 0; i < gridWidth; i++) {
	grid[i] = new Array(gridHeight);
}

//Initialize grid start
var xPlacement = 9; 
var yPlacement = 11;

grid[0][0] = new Box(xPlacement,yPlacement);
grid[0][0].i = 0;
grid[0][0].k = 0;

for (var i = 0; i < gridWidth; i++) {
	if(i == 0)
		for (var k = 1; k < gridHeight; k++) {
			yPlacement = yPlacement + 111.25;
			grid[i][k] = new Box(xPlacement, yPlacement);
			grid[i][k].i = i;
			grid[i][k].k = k;
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
			grid[i][k].i = i;
			grid[i][k].k = k;
		}	
	}
	xPlacement = xPlacement + 111.25;
	yPlacement = 11;
}

//For base
grid[0][2].occupied = true;
grid[0][3].occupied = true;
grid[16][2].occupied = true;
grid[16][3].occupied = true;

//Initialize grid End
function stageCoordToGrid(x, y) {
	for(var i = 0; i < gridWidth; ++i) {
		for(var j = 0; j < gridHeight; ++j) {
			if(grid[i][j].x <= x && grid[i][j].y <= y && grid[i][j].x + 111.25 >= x && grid[i][j].y + 100.25 >= y)
				return grid[i][j];
		}
	}
}

socket.on('newUserData', function(data) {
    users = data;
});

function loadFort(event){

	var right = new createjs.Bitmap(queue.getResult("rightFight"));
	right.x = 800;
	right.y = 430;
	var left = new createjs.Bitmap(queue.getResult("leftFight"));
	left.x = -800;
	left.y = -230;

    socket.emit('requestUserData', 0);
	currentState = state["game"];
	var userName = document.getElementById("userName");
	console.log("LOAD FORT"); 
	readyButton.removeEventListener("click", readyUp);
	buildButton.addEventListener("click", loadMenu);
	buildButton.graphics.beginFill("#000000").drawRect(260, 835, 137, 45);
	attackButton.addEventListener("click", attack);
	attackButton.graphics.beginFill("#000000").drawRect(262, 911, 137, 45);
	attackButton.alpha = 0.01;
	settingsButton.graphics.beginFill("#000000").drawRect(260, 755, 137, 45);
	settingsButton.addEventListener("click", loadSettings);
	settingsButton.alpha = 0.01;
	stage.addChild(buildButton);
	stage.addChild(attackButton);
	stage.addChild(settingsButton);



	var field = new createjs.Bitmap(queue.getResult("field"));
	lowerMenu = new createjs.Bitmap(queue.getResult("lowerMenu"));
	lowerMenu.y = 875;

    leftBase = new createjs.Bitmap(queue.getResult("leftBase"));
    rightBase = new createjs.Bitmap(queue.getResult("rightBase"));

    leftBase.x = 14;
    leftBase.y = 235;
    rightBase.x = 1799;
    rightBase.y = 235;

    stage.addChild(field);

	highlightGrid = new createjs.Bitmap(queue.getResult("highlightGrid"));
    switch (myIndex){
        case 0:
            highlightGrid.x = 6;
            highlightGrid.y = 10;
			break;
        case 1:
            highlightGrid.x = 6;
            highlightGrid.y = 348;
			break;
        case 2:
            highlightGrid.x = 1347;
            highlightGrid.y = 9;
			break;
        case 3:
            highlightGrid.x = 1347;
            highlightGrid.y = 347;
			break;
        default:
            highlightGrid.x = 6;
            highlightGrid.y = 10;
			break;
    }
    highlightGrid.alpha = .4;
    stage.addChild(highlightGrid);
    stage.addChild(leftBase);
    stage.addChild(rightBase);


	stage.addChild(right);
	stage.addChild(left);

	playerNameText[0] = new createjs.Text(userNames[0], "bold 60px Lithos", "#FFFFFF");
	playerNameText[1] = new createjs.Text(userNames[1], "bold 60px Lithos", "#FFFFFF");
	playerNameText[2] = new createjs.Text(userNames[2], "bold 60px  Lithos", "#FFFFFF");
	playerNameText[3] = new createjs.Text(userNames[3], "bold 60px Lithos", "#FFFFFF");
	playerNameText[0].x = -730;
	playerNameText[0].y = -73;
	playerNameText[1].x = -730;
	playerNameText[1].y = 38;
	playerNameText[2].x = 2085;
	playerNameText[2].y = 527;
	playerNameText[3].x = 2085;
	playerNameText[3].y = 638;

	stage.addChild(playerNameText[0]);
	stage.addChild(playerNameText[1]);
	stage.addChild(playerNameText[2]);
	stage.addChild(playerNameText[3]);

	stage.addChild(lowerMenu);
	createjs.Tween.get(lowerMenu).to({y:675}, 850);

	createjs.Tween.get(playerNameText[0]).to({x:70, y:227}, 850).call(fadeName(0));
	createjs.Tween.get(playerNameText[1]).to({x:70, y:338}, 850).call(fadeName(1));
	createjs.Tween.get(playerNameText[2]).to({x:1285, y:227}, 850).call(fadeName(2));
	createjs.Tween.get(playerNameText[3]).to({x:1285, y:338}, 850).call(fadeName(3));

	createjs.Tween.get(right).to({x:0, y:150}, 850).call(fadeRight);
	function fadeRight() {
		createjs.Tween.get(right).wait(1500).to({alpha: 0}, 900);
	}
	createjs.Tween.get(left).to({x:0, y:150}, 850).call(fadeLeft);
	function fadeLeft() {
		createjs.Tween.get(left).wait(1500).to({alpha: 0}, 900);
	}
	function fadeName(n) {
		createjs.Tween.get(playerNameText[n]).wait(1800).to({alpha: 0}, 900);
	}

	playerText = new createjs.Text(myIndex + 1, "bold 100px Lithos", "#fff");
	playerText.x = 100;
	playerText.y = 1040;
	stage.addChild(playerText);
	
	moneyText = new createjs.Text("Money:", "bold 80px Lithos", "#fff");
	moneyText.x = 705;
	moneyText.y = 950;
	stage.addChild(moneyText);
	
	moneyAmountText = new createjs.Text(money, "bold 80px Lithos", "#fff");
	moneyAmountText.x = 1065;
	moneyAmountText.y = 950;
	stage.addChild(moneyAmountText);
	
	timerText = new createjs.Text("0:45", "50px Lithos", "#000");
	timerText.x = 505;
	timerText.y = 1055;
	stage.addChild(timerText);
	
	zombieCapText = new createjs.Text(totalcap, "bold 23px Lithos", "#fff");
	zombieCapText.x = 1060;
	zombieCapText.y = 1050;
	stage.addChild(zombieCapText);
	
	zombieCapacityText = new createjs.Text("Total Zombie Capacity:", "bold 23px Lithos", "#fff");
	zombieCapacityText.x = 710;
	zombieCapacityText.y = 1050;
	stage.addChild(zombieCapacityText);
	
	usedZombieCapText = new createjs.Text(usedZombieCap, "bold 23px Lithos", "#fff");
	usedZombieCapText.x = 1060;
	usedZombieCapText.y = 1080;
	stage.addChild(usedZombieCapText);

	usedZombieCapacityText = new createjs.Text("Used Zombie Capacity:", "bold 23px Lithos", "#fff");
	usedZombieCapacityText.x = 710;
	usedZombieCapacityText.y = 1080;
	stage.addChild(usedZombieCapacityText);
	
	teamHealthCover = new createjs.Bitmap(queue.getResult("healthCover"));
    stage.addChild(teamHealthCover);
	teamHealthCover.regX = 464;
	teamHealthCover.x = 1898;
	teamHealthCover.y = 985;
	teamHealthCover.scaleY = 1.05;
	
	enemyHealthCover = new createjs.Bitmap(queue.getResult("healthCover"));
	stage.addChild(enemyHealthCover);
	enemyHealthCover.regX = 464;
	enemyHealthCover.x = 1898;
	enemyHealthCover.y = 1096;
	enemyHealthCover.scaleY = 1.05;


	createjs.Tween.get(teamHealthCover).to({scaleX:0},1760);
	createjs.Tween.get(enemyHealthCover).to({scaleX:0},1760);

	timerMins = timerIntMins;
	timerSecs = timerIntSecs;
	setInterval(function() {
		if(timerSecs == 0 && timerMins > 0) {
			timerSecs = 59;
			--timerMins;
		} else if (timerMins <= 0 && timerSecs <= 0) {
			timerMins = timerIntMins;
			timerSecs = timerIntSecs;
			money += income + (income * banks.length);
			moneyAmountText.text = money;
		} else {
			--timerSecs
		}
		var timerSecsText = timerSecs;
		if(timerSecs < 10)
			timerSecsText = "0" + timerSecsText;
		timerText.text = timerMins + ":" + timerSecsText;	
	}, 1000);

	// tween labels
	createjs.Tween.get(lowerMenu).to({y:675}, 850);
	createjs.Tween.get(playerText).to({y:840}, 850);
	createjs.Tween.get(moneyText).to({y:750}, 850);
	createjs.Tween.get(moneyAmountText).to({y:750}, 850);
	createjs.Tween.get(timerText).to({y:855}, 850);
	createjs.Tween.get(zombieCapText).to({y:850}, 850);
	createjs.Tween.get(zombieCapacityText).to({y:850}, 850);
	createjs.Tween.get(usedZombieCapText).to({y:880}, 850);
	createjs.Tween.get(usedZombieCapacityText).to({y:880}, 850);
	createjs.Tween.get(teamHealthCover).to({y:785}, 850);
	createjs.Tween.get(enemyHealthCover).to({y:900}, 850);
}

function scaleBar(teamHp, enemyHp){
	var k = 4000 - teamHp
	var j = 4000 - enemyHp
	var teamScale = (k/(2*baseHp));
	var enemyScale = (j/(2*baseHp));
	createjs.Tween.get(teamHealthCover).to({scaleX:teamScale},300);
	createjs.Tween.get(enemyHealthCover).to({scaleX:enemyScale},300);
}
		
function loadMenu(event){
	console.log("LOAD MENU"); 
	buildButton.removeEventListener("click", loadMenu);
	stage.removeChild(attackButton);
	stage.removeChild(settingsButton);
	loadBuildingButton.addEventListener("click", loadBuildingMenu);
	loadBuildingButton.graphics.beginFill("#0000F").drawRect(812, 229, 310, 288);
	
	loadZombieButton.graphics.beginFill("#0000F").drawRect(422, 229, 310, 288);   ////Added zombie button to build menu
    loadZombieButton.addEventListener("click", loadZombieMenu);
	loadDefenseButton.graphics.beginFill("#0000F").drawRect(1183, 229, 310, 288);  //// "   Defense "
    loadDefenseButton.addEventListener("click", loadDefenseMenu);
	closeBuildMenuButton.graphics.beginFill("#0000F").drawRect(1548, 110, 46, 46);  //// X close button was built!!
    closeBuildMenuButton.alpha = .1;
	closeBuildMenuButton.addEventListener("click", closeBuildMenu); //Added button Listener to close
	
	stage.addChild(loadDefenseButton); //Sergio
	stage.addChild(loadZombieButton); //Sergio
	stage.addChild(closeBuildMenuButton); //Sergio
	stage.addChild(loadBuildingButton);
	
	buildMenu = new createjs.Bitmap(queue.getResult("buildMenu"));  //Declared as global now  --Sergio

	buildMenu.x = 310;
	buildMenu.y = 90;


	stage.addChild(buildMenu);
}

function addFpsBmp(){
	switch(fps){
		case 30:
			stage.addChild(fps30);
			break;
		case 45:
			stage.addChild(fps45);
			break;
		case 60:
			stage.addChild(fps60);
			break;
		default:
			console.log("Error: Invalid fps("+ fps +")");
	}
}

function removePrevFpsBmp(){
	switch(prevFPS){
		case 30:
			stage.removeChild(fps30);
			break;
		case 45:
			stage.removeChild(fps45);
			break;
		case 60:
			stage.removeChild(fps60);
			break;
		default:
			console.log("Error: Invalid fps("+ fps +")");
	}
}

function removePrevSoundBmp(){
	if(prevSound)
		stage.removeChild(soundOnBmp);
	else
		stage.removeChild(soundOffBmp);
}

function addSoundBmp(){
	if(soundOn)
		stage.addChild(soundOnBmp);
	else
		stage.addChild(soundOffBmp);
}

function loadSettings(){
	prevFPS = fps;
	prevSound = soundOn;

	buildButton.removeEventListener("click", loadMenu);
	stage.removeChild(attackButton);
	stage.removeChild(settingsButton);

	fps30 = new createjs.Bitmap(queue.getResult("30Fps"));
	fps30.x = 653;
	fps30.y = 393;
	fps45 = new createjs.Bitmap(queue.getResult("45Fps"));
	fps45.x = 653;
	fps45.y = 393;
	fps60 = new createjs.Bitmap(queue.getResult("60Fps"));
	fps60.x = 653;
	fps60.y = 393;

	soundOnBmp = new createjs.Bitmap(queue.getResult("soundOn"));
	soundOnBmp.x = 757;
	soundOnBmp.y = 220;
	soundOffBmp = new createjs.Bitmap(queue.getResult("soundOff"));
	soundOffBmp.x = 757;
	soundOffBmp.y = 220;

	quitGame.graphics.beginFill("#0000F").drawRect(848, 558, 227, 75);
	quitGame.alpha = .01;
	quitGame.addEventListener("click", function() {
		if (confirm('Are you sure you want to leave FORT OUTBREAK?')) {
			window.location.href = "http://engineering.tamu.edu/cse/";
		} else {

		}
	});

	fpsButton30.graphics.beginFill("#0000F").drawRect(653, 393, 210, 58);
	fpsButton30.alpha = .01;
	fpsButton30.addEventListener("click", function() {
		fps = 30;
		removePrevFpsBmp();
		addFpsBmp();
		createjs.Ticker.setFPS(fps);
		prevFPS = fps;
	});

	fpsButton45.graphics.beginFill("#0000F").drawRect(863, 393, 202, 58);
	fpsButton45.alpha = .01;
	fpsButton45.addEventListener("click", function() {
		fps = 45;
		removePrevFpsBmp();
		addFpsBmp();
		createjs.Ticker.setFPS(fps);
		prevFPS = fps;
	});

	fpsButton60.graphics.beginFill("#0000F").drawRect(1064, 393 , 205, 58);
	fpsButton60.alpha = .01;
	fpsButton60.addEventListener("click", function() {
		fps = 60;
		removePrevFpsBmp();
		addFpsBmp();
		createjs.Ticker.setFPS(fps);
		prevFPS = fps;
	});

	soundOnButton.graphics.beginFill("#0000F").drawRect(757, 220, 210, 58);
	soundOnButton.alpha = .01;
	soundOnButton.addEventListener("click", function() {
		soundOn = true;
		removePrevSoundBmp();
		addSoundBmp();
		createjs.Sound.alternateExtensions = ["wav"];
		createjs.Sound.registerSound("sounds/zombieAttack.wav", "zombieAttack");
		createjs.Sound.registerSound("sounds/zombieDied.wav", "zombieDied");
		createjs.Sound.registerSound("sounds/buildingDestroyed.wav", "buildingDestroyed");
		createjs.Sound.registerSound("sounds/buildingPlaced.wav", "buildingPlaced");
		createjs.Sound.registerSound("sounds/smallZombiePlaced.wav", "smallZombiePlaced");
		createjs.Sound.registerSound("sounds/kingZombiePlaced.wav", "kingZombiePlaced");
		createjs.Sound.registerSound("sounds/victory.wav", "victory");
		createjs.Sound.registerSound("sounds/youLose.wav", "youLose");
		//createjs.Sound.registerSound("sounds/flames.mp3", "flames");
		//We only want to have one of this at a time (or it sounds nasty :D)
		createjs.Sound.registerSound("sounds/flames.mp3", "flames", 1);
		createjs.Sound.registerSound("sounds/orbShotFired.mp3", "orbShotFired");
		createjs.Sound.registerSound("sounds/turretShotFired.mp3", "turretShotFired");
		prevSound = soundOn;
	});

	soundOffButton.graphics.beginFill("#0000F").drawRect(967, 220, 210, 58);
	soundOffButton.alpha = .01;
	soundOffButton.addEventListener("click", function() {
		soundOn = false;
		removePrevSoundBmp();
		addSoundBmp();
		createjs.Sound.removeAllSounds();
		prevSound = soundOn;
	});

	closeSettings.graphics.beginFill("#0000F").drawRect(1263, 53, 46, 46);
	closeSettings.alpha = .01;
	closeSettings.addEventListener("click", closeSettingsMenu);

	settingsMenu = new createjs.Bitmap(queue.getResult("settings"));
	settingsMenu.x = 586;
	settingsMenu.y = 40;
	stage.addChild(settingsMenu);

	addFpsBmp();
	addSoundBmp();

	stage.addChild(closeSettings);
	stage.addChild(fpsButton30);
	stage.addChild(fpsButton45);
	stage.addChild(fpsButton60);
	stage.addChild(soundOnButton);
	stage.addChild(soundOffButton);
	stage.addChild(quitGame);
}

function loadZombieMenu(event){
    loadDefenseButton.removeEventListener("click", loadDefenseMenu);
    loadZombieButton.removeEventListener("click", loadZombieMenu);
    loadBuildingButton.removeEventListener("click", loadBuildingMenu);
    closeBuildMenuButton.removeEventListener("click", closeBuildMenu);

    stage.removeChild(buildMenu);
    stage.removeChild(loadBuildingButton); //Remove Old building menu image --Sergio
    stage.removeChild(loadDefenseButton); //Sergio
    stage.removeChild(loadZombieButton); //Sergio
    stage.removeChild(closeBuildMenuButton);
    stage.removeChild(attackButton);
    stage.removeChild(lowerMenu);
    stage.removeChild(lowerMenu);
    stage.removeChild(moneyAmountText);
    stage.removeChild(playerText);
    stage.removeChild(moneyText);
    stage.removeChild(timerText);
	stage.removeChild(zombieCapText);
	stage.removeChild(zombieCapacityText);
	stage.removeChild(usedZombieCapText);
	stage.removeChild(usedZombieCapacityText);
	stage.removeChild(enemyHealthCover);
	stage.removeChild(teamHealthCover);

	doneButton = new createjs.Bitmap(queue.getResult("doneButton"));
    zombiesMenu = new createjs.Bitmap(queue.getResult("zombiesMenu"));

    doneButton.addEventListener("click", closeZombieMenu);

    zombiesMenu.y = 674;
    doneButton.x = 1525;
    doneButton.y = 860;
    greenZombie.x = 454;
    greenZombie.y = 842;
    blueZombie.x = 454;
    blueZombie.y = 842;
    blueKing.x = 953;
    blueKing.y = 814;
    greenKing.x = 953;
    greenKing.y = 814;

    stage.addChild(zombiesMenu);
    stage.addChild(doneButton);
	
	var small;
	var king;
	
    if(myIndex >= 2){
        king = blueKing;
        small = blueZombie;
    }
    else{
        king = greenKing;
        small = greenZombie;
    }
	
	stage.addChild(small);
	stage.addChild(king);
	
	smallZombieButton = new createjs.Shape();
	smallZombieButton.graphics.beginFill("#000").drawRect(350,740,235,225);
	smallZombieButton.alpha = 0.01;
	smallZombieButton.addEventListener("click", function(event) {
		placeZombie(smallZombiePrice, "small");
	});
	
	kingZombieButton = new createjs.Shape();
	kingZombieButton.graphics.beginFill("#000").drawRect(880,740,235,225);
	kingZombieButton.alpha = 0.01;
	kingZombieButton.addEventListener("click", function(event) {
		placeZombie(kingZombiePrice, "king");
	});
	
	smallZombieCost= new createjs.Text("$" + smallZombiePrice, "bold 25px Lithos", "#fff");
	smallZombieCost.x = 433;
	smallZombieCost.y = 923;
	
	kingZombieCost= new createjs.Text("$" + kingZombiePrice, "bold 25px Lithos", "#fff");
	kingZombieCost.x = 961;
	kingZombieCost.y = 923;
	
	//Beginning Stats
	
	kingZombieHpStat = new createjs.Text(kingZombieHp, "bold 23px Lithos", "#fff");
	kingZombieHpStat.x = 1185;
	kingZombieHpStat.y = 798;

	kingZombieSpeedStat = new createjs.Text(kingZombieSpeed, "bold 23px Lithos", "#fff");
	kingZombieSpeedStat.x = 1245;
	kingZombieSpeedStat.y = 842;
		
	kingZombieAttackStat = new createjs.Text(kingZombieAttack, "bold 23px Lithos", "#fff");
	kingZombieAttackStat.x = 1245;
	kingZombieAttackStat.y = 890;

	smallZombieHpStat = new createjs.Text(smallZombieHp, "bold 23px Lithos", "#fff");
	smallZombieHpStat.x = 658;
	smallZombieHpStat.y = 794;

	smallZombieSpeedStat = new createjs.Text(smallZombieSpeed, "bold 23px Lithos", "#fff");
	smallZombieSpeedStat.x = 715;
	smallZombieSpeedStat.y = 840;
		
	smallZombieAttackStat = new createjs.Text(smallZombieAttack, "bold 23px Lithos", "#fff");
	smallZombieAttackStat.x = 715;
	smallZombieAttackStat.y = 885;	

	//End Stats
	
	stage.addChild(smallZombieButton);
	stage.addChild(kingZombieButton);
	stage.addChild(smallZombieCost);
	stage.addChild(kingZombieCost);
	stage.addChild(kingZombieHpStat);
	stage.addChild(kingZombieSpeedStat);
	stage.addChild(kingZombieAttackStat);
	stage.addChild(smallZombieHpStat);
	stage.addChild(smallZombieSpeedStat);
	stage.addChild(smallZombieAttackStat);
}

function loadBuildingMenu(event){
    loadDefenseButton.removeEventListener("click", loadDefenseMenu);
    loadZombieButton.removeEventListener("click", loadZombieMenu);
    loadBuildingButton.removeEventListener("click", loadBuildingMenu);
    closeBuildMenuButton.removeEventListener("click", closeBuildMenu);

    stage.removeChild(buildMenu); //Remove Old building menu image --Sergio
    stage.removeChild(loadBuildingButton); //Remove Old building menu image --Sergio
    stage.removeChild(loadDefenseButton); //Sergio
    stage.removeChild(loadZombieButton); //Sergio
    stage.removeChild(closeBuildMenuButton);
    stage.removeChild(lowerMenu);
    stage.removeChild(moneyAmountText);
    stage.removeChild(playerText);
    stage.removeChild(moneyText);
    stage.removeChild(timerText);
	stage.removeChild(zombieCapText);
	stage.removeChild(zombieCapacityText);
	stage.removeChild(usedZombieCapText);
	stage.removeChild(usedZombieCapacityText);
	stage.removeChild(enemyHealthCover);
	stage.removeChild(teamHealthCover);
	
    console.log("LOAD BUILDING");



    buildingsMenu = new createjs.Bitmap(queue.getResult("buildingsMenu"));
    buildingsMenu.y = 674;

    factoryImage = new createjs.Bitmap(queue.getResult("factory"))
    factoryImage.x = 400;
    factoryImage.y = 800;

	factoryButton = new createjs.Shape();
    factoryButton.graphics.beginFill("#000000").drawRect(350, 740, 235, 225);
    factoryButton.addEventListener("click", function(event) {
		placeBuilding(event, buildingPrice, factoryImage, "factory");
	});
    factoryButton.alpha = 0.01;
	
    bank = new createjs.Bitmap(queue.getResult("bank"));
    bank.x = 940;
    bank.y = 804;
	
	bankButton = new createjs.Shape();
	bankButton.graphics.beginFill("#000").drawRect(880,740,235,225);
	bankButton.addEventListener("click", function(event) {
		placeBuilding(event, buildingPrice, bank, "bank");
	});
	bankButton.alpha = 0.01;
	
	cage = new createjs.Bitmap(queue.getResult("cage"));
    cage.x = 1467;
    cage.y = 797;
	
	cageButton = new createjs.Shape();
	cageButton.graphics.beginFill("#000").drawRect(1400,740,235,225);
	cageButton.addEventListener("click", function(event) {
		placeBuilding(event, buildingPrice, cage, "cage");
	});
	cageButton.alpha = 0.01;
	
	buildingsDoneButton = new createjs.Bitmap(queue.getResult("doneButton"));
    buildingsDoneButton.addEventListener("click", closeBuildingsMenu);
    buildingsDoneButton.x = 1687;
    buildingsDoneButton.y = 874;

    attackButton.graphics.beginFill("#000000").drawRect(260, 906, 147, 55);
    attackButton.alpha = 0.01;
	
	factoryCost= new createjs.Text("$" + buildingPrice, "bold 25px Lithos", "#fff");
	factoryCost.x = 432;
	factoryCost.y = 923;
	
	bankCost= new createjs.Text("$" + buildingPrice, "bold 25px Lithos", "#fff");
	bankCost.x = 966;
	bankCost.y = 923;
	
	cageCost= new createjs.Text("$" + buildingPrice, "bold 25px Lithos", "#fff");
	cageCost.x = 1484;
	cageCost.y = 923;

	
    stage.addChild(factoryButton);
    stage.addChild(buildingsMenu);
    stage.addChild(bank);
    stage.addChild(cage);
    stage.addChild(factoryImage);
	stage.addChild(bankButton);
	stage.addChild(cageButton);
	stage.addChild(buildingsDoneButton);
	stage.addChild(factoryCost);
	stage.addChild(bankCost);
	stage.addChild(cageCost);
}

function loadDefenseMenu(event) {
    loadDefenseButton.removeEventListener("click", loadDefenseMenu);
    loadZombieButton.removeEventListener("click", loadZombieMenu);
    loadBuildingButton.removeEventListener("click", loadBuildingMenu);
    closeBuildMenuButton.removeEventListener("click", closeBuildMenu);

    stage.removeChild(buildMenu); //Remove Old building menu image --Sergio
    stage.removeChild(loadBuildingButton); //Remove Old building menu image --Sergio
    stage.removeChild(loadDefenseButton); //Sergio
    stage.removeChild(loadZombieButton); //Sergio
    stage.removeChild(closeBuildMenuButton);
    stage.removeChild(attackButton);
    stage.removeChild(lowerMenu);
    stage.removeChild(moneyAmountText);
    stage.removeChild(playerText);
    stage.removeChild(moneyText);
    stage.removeChild(timerText);
	stage.removeChild(zombieCapText);
	stage.removeChild(zombieCapacityText);
	stage.removeChild(usedZombieCapText);
	stage.removeChild(usedZombieCapacityText);
	stage.removeChild(enemyHealthCover);
	stage.removeChild(teamHealthCover);
	
    defensesMenu = new createjs.Bitmap(queue.getResult("defensesMenu"));
    defensesDoneButton = new createjs.Bitmap(queue.getResult("doneButton"));
    turret = new createjs.Bitmap(queue.getResult("turret"));
    orb = new createjs.Bitmap(queue.getResult("orb"));
    defensesDoneButton.addEventListener("click", closeDefensesMenu);
	
    defensesMenu.y = 659;
    orb.x = 942;
    orb.y = 805;
    turret.x = 400;
    turret.y = 804;
    defensesDoneButton.x = 1525;
    defensesDoneButton.y = 860;

	turretButton = new createjs.Shape();
	turretButton.graphics.beginFill("#000").drawRect(350,750,240,215);
	turretButton.alpha = 0.01;
	turretButton.addEventListener('click', function(event) {
		placeBuilding(event, turretPrice, turret, "turret");
	});
	
	orbButton = new createjs.Shape();
	orbButton.graphics.beginFill("#000").drawRect(870,750,240,215);
	orbButton.alpha = 0.01;
	orbButton.addEventListener('click', function(event) {
		placeBuilding(event, orbPrice, orb, "orb");
	});
	
	turretCost= new createjs.Text("$" + turretPrice, "bold 25px Lithos", "#fff");
	turretCost.x = 418;
	turretCost.y = 923;
	
	orbCost= new createjs.Text("$" + orbPrice, "bold 25px Lithos", "#fff");
	orbCost.x = 948;
	orbCost.y = 923;
	
	//Beginning Stats

	turretHpStat = new createjs.Text(buildingHp, "bold 23px Lithos", "#fff");
	turretHpStat.x = 674;
	turretHpStat.y = 838;

	turretSpeedStat = new createjs.Text(turretSpeed, "bold 23px Lithos", "#fff");
	turretSpeedStat.x = 730;
	turretSpeedStat.y = 888;
		
	turretAttackStat = new createjs.Text(turretAttack, "bold 23px Lithos", "#fff");
	turretAttackStat.x = 730;
	turretAttackStat.y = 930;
	
	
	orbHpStat = new createjs.Text(buildingHp, "bold 23px Lithos", "#fff");
	orbHpStat.x = 1195;
	orbHpStat.y = 838;

	orbSpeedStat = new createjs.Text(orbSpeed, "bold 23px Lithos", "#fff");
	orbSpeedStat.x = 1249;
	orbSpeedStat.y = 888;	
		
	orbAttackStat = new createjs.Text(orbAttack, "bold 23px Lithos", "#fff");
	orbAttackStat.x = 1249;
	orbAttackStat.y = 930;
	
	//End Stats
	
	stage.addChild(turretButton);
	stage.addChild(orbButton);
    stage.addChild(defensesMenu);
    stage.addChild(defensesDoneButton);
    stage.addChild(orb);
    stage.addChild(turret);
	stage.addChild(orbCost);
	stage.addChild(turretCost);
	stage.addChild(turretHpStat);
	stage.addChild(turretSpeedStat);
	stage.addChild(turretAttackStat);
	stage.addChild(orbHpStat);
	stage.addChild(orbSpeedStat);
	stage.addChild(orbAttackStat);
}

function closeBuildMenu(even){
////-----------------------Dont forget to REMOVE LISTENERS!!!!!!!! -----Sergio
		stage.removeChild(buildMenu); //Remove Old building menu image --Sergio
		stage.removeChild(loadBuildingButton); //Remove Old building menu image --Sergio
		stage.removeChild(loadDefenseButton); //Sergio
		stage.removeChild(loadZombieButton); //Sergio
		stage.removeChild(closeBuildMenuButton);
		stage.addChild(attackButton);
		loadBuildingButton.removeEventListener("click", loadBuildingMenu);
		closeBuildMenuButton.removeEventListener("click", closeBuildMenu);
        buildButton.addEventListener("click", loadMenu);
		settingsButton.addEventListener("click", loadSettings);
		stage.addChild(settingsButton);
}



function closeSettingsMenu(){
	stage.removeChild(settingsMenu);
	stage.removeChild(closeSettings);

	removePrevFpsBmp(prevFPS);

	if(soundOn)
		stage.removeChild(soundOnBmp);
	else
		stage.removeChild(soundOffBmp);

	stage.removeChild(fpsButton30);
	stage.removeChild(fpsButton45);
	stage.removeChild(fpsButton60);
	stage.removeChild(soundOnButton);
	stage.removeChild(soundOffButton);
	stage.removeChild(quitGame);

	// Remember: Remove buildings creation event listeners

	buildButton.addEventListener("click", loadMenu);
	settingsButton.addEventListener("click", loadSettings);
	stage.addChild(settingsButton);
	stage.addChild(attackButton);

}

function closeZombieMenu(even){
    stage.removeChild(zombiesMenu);
    stage.removeChild(doneButton);

    // Remember: Remove zombie creation event listeners

    doneButton.removeEventListener("click", closeZombieMenu);
    stage.addChild(lowerMenu);
	stage.addChild(attackButton);

    buildButton.addEventListener("click", loadMenu);
    stage.removeChild(buildingsMenu);
    stage.addChild(lowerMenu);
    stage.addChild(moneyText);
    stage.addChild(moneyAmountText);
    stage.addChild(playerText);
    stage.addChild(timerText);
	
	stage.addChild(zombieCapText);
	stage.addChild(zombieCapacityText);
	stage.addChild(usedZombieCapText);
	stage.addChild(usedZombieCapacityText);
	
	stage.addChild(enemyHealthCover);
	stage.addChild(teamHealthCover);

    stage.removeChild(greenKing);
    stage.removeChild(greenZombie);
    stage.removeChild(blueKing);
    stage.removeChild(blueZombie);
	stage.removeChild(smallZombieButton);
	stage.removeChild(kingZombieButton);
	stage.removeChild(smallZombieCost);
	stage.removeChild(kingZombieCost);
	stage.removeChild(smallZombieHpStat);
	stage.removeChild(smallZombieAttackStat);
	stage.removeChild(smallZombieSpeedStat);
	stage.removeChild(kingZombieHpStat);
	stage.removeChild(kingZombieAttackStat);
	stage.removeChild(kingZombieSpeedStat);

	settingsButton.addEventListener("click", loadSettings);
	stage.addChild(settingsButton);
}

function closeBuildingsMenu(even){
	stage.removeChild(defensesMenu);
	stage.removeChild(buildingsDoneButton);
	stage.removeChild(factoryButton);
	stage.removeChild(bankButton);
	stage.removeChild(cageButton);
	stage.removeChild(factoryImage);
    stage.removeChild(bank);
    stage.removeChild(cage);
	stage.removeChild(factoryCost);
	stage.removeChild(bankCost);
	stage.removeChild(cageCost);

	
	// Remember: Remove buildings creation event listeners
	factoryButton.removeEventListener("click", factoryButton._onClick);
	
	buildingsDoneButton.removeEventListener("click", closeBuildingsMenu);
	stage.addChild(lowerMenu);
	
	buildButton.addEventListener("click", loadMenu);
	stage.removeChild(buildingsMenu);
	stage.addChild(lowerMenu);
	stage.addChild(moneyText);
	stage.addChild(moneyAmountText);
	stage.addChild(playerText);
	stage.addChild(timerText);
	stage.addChild(attackButton);
	stage.addChild(zombieCapText);
	stage.addChild(zombieCapacityText);
	stage.addChild(usedZombieCapText);
	stage.addChild(usedZombieCapacityText);
	stage.addChild(enemyHealthCover);
	stage.addChild(teamHealthCover);

	settingsButton.addEventListener("click", loadSettings);
	stage.addChild(settingsButton);
}

function closeDefensesMenu(even){
    stage.removeChild(defensesMenu);
    stage.removeChild(defensesDoneButton);
    stage.removeChild(orb);
    stage.removeChild(turret);
	stage.removeChild(orbButton);
	stage.removeChild(turretButton);
	stage.removeChild(orbCost);
	stage.removeChild(turretCost);
	stage.removeChild(turretHpStat);
	stage.removeChild(turretSpeedStat);
	stage.removeChild(turretAttackStat);
	stage.removeChild(orbHpStat);
	stage.removeChild(orbSpeedStat);
	stage.removeChild(orbAttackStat);
    // Remember: Remove defense creation event listeners

    defensesDoneButton.removeEventListener("click", closeDefensesMenu);
    stage.addChild(lowerMenu);

    buildButton.addEventListener("click", loadMenu);
    stage.removeChild(buildingsMenu);
    stage.addChild(lowerMenu);
    stage.addChild(moneyText);
    stage.addChild(moneyAmountText);
    stage.addChild(playerText);
    stage.addChild(timerText);
	stage.addChild(attackButton);
	stage.addChild(zombieCapText);
	stage.addChild(zombieCapacityText);
	stage.addChild(usedZombieCapText);
	stage.addChild(usedZombieCapacityText);
	stage.addChild(enemyHealthCover);
	stage.addChild(teamHealthCover);

	settingsButton.addEventListener("click", loadSettings);
	stage.addChild(settingsButton);
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

function explode(x, y, size, duration) {
	var explosion = new createjs.Bitmap(queue.getResult("explosion"));
	explosion.scaleX = size;
	explosion.scaleY = size;
	explosion.regX = 32.5;
	explosion.regY = 29;
	explosion.x = x + 55.625;
	explosion.y = y + 50.125;
	stage.addChild(explosion);
	createjs.Tween.get(explosion).to({scaleX: 0, scaleY: 0}, duration).call(removeExplosion);
	function removeExplosion(){
		stage.removeChild(explosion);
	}
}

function burst(x, y){
	var burst = new createjs.Bitmap(queue.getResult("burst"));
	burst.scaleX = .5;
	burst.scaleY = .5;
	burst.regX = 166;
	burst.regY = 162;
	burst.alpha = .8;
	burst.x = x + 55.625;
	burst.y = y + 50.125;
	stage.addChild(burst);
	createjs.Tween.get(burst).to({scaleX: 1, scaleY: 1, rotation: 360, alpha: .4}, 800).call(fadeExplosion);
	function fadeExplosion() {
		createjs.Tween.get(burst).to({alpha: 0}, 500).call(removeExplosion);
	}
	function removeExplosion() {
		stage.removeChild(burst);
	}
}

function victory() {
	var screen = new createjs.Shape();
	screen.graphics.beginFill("#000").drawRect(0,0,1920,980);
	screen.addEventListener("click", function(){});
	screen.alpha = 0.0;
	// TODO lets add winning usernames
	var victoryText = new createjs.Text("Victory!", "bold 150px Lithos", "#fff");
	victoryText.x = 585;
	victoryText.y = 280;
	victoryText.alpha = 0.0;
	
	stage.addChild(screen);
	stage.addChild(victoryText);
	createjs.Tween.get(screen).to({alpha:0.7}, 500);
	createjs.Tween.get(victoryText).to({alpha:0.7}, 500);
	createjs.Sound.play("victory");
}

function lose() {
	var screen = new createjs.Shape();
	screen.graphics.beginFill("#000").drawRect(0,0,1920,980);
	screen.addEventListener("click", function(){});
	screen.alpha = 0.0;
	
	var loseText = new createjs.Text("You Lose!", "bold 150px Lithos", "#fff");
	loseText.x = 550;
	loseText.y = 280;
	loseText.alpha = 0.0;
	
	stage.addChild(screen);
	stage.addChild(loseText);
	createjs.Tween.get(screen).to({alpha:0.7}, 500);
	createjs.Tween.get(loseText).to({alpha:0.7}, 500);
	createjs.Sound.play("youLose");
}

function rotateToPoint(sprite, x, y, regX, regY, animate) {
	var deltaX = x - sprite.x;
	var deltaY = y - sprite.y;
	
	if(regX != null && regY != null) {
		sprite.regX = regX;
		sprite.regY = regY;
	} else {
		sprite.regX = sprite.image.width / 2;
		sprite.regY = sprite.image.height / 2;
	}
	
	if(!sprite.readyToRotate) {
		sprite.x += sprite.regX;
		sprite.y += sprite.regY;
		sprite.readyToRotate = true;
	}
	
	var angleInDegrees = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
	
	if(animate)
		createjs.Tween.get(sprite).to({rotation:angleInDegrees}, 200);
	else
		sprite.rotation = angleInDegrees;
}

function tick(event){
    stage.update();
}