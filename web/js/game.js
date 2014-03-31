var buildButton = new createjs.Shape();
var closeMenuButton = new createjs.Shape();  //Sergio

var loadBuildingButton = new createjs.Shape();   //Made this Global to be able to be removed later -- Sergio
var loadZombieButton = new createjs.Shape();  //Create this to separate one button intro three functional buttons that do different thing
var loadDefenseButton = new createjs.Shape();

var attackButton = new createjs.Shape();
var buildMenu;  //Made this global  --Sergio

var users = new Array();

// A* Pathfinding Variables 
// Reference: https://github.com/prettymuchbryce/easystarjs
var easystar = new EasyStar.js();

var grid = new Array(17);
for (var i = 0; i < 17; i++) {
	grid[i] = new Array(6);
}

easystar.setGrid(grid);
easystar.enableDiagonals();

socket.on('newUserData', function(data) {
    users = data;
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


////-----------------------Dont forget to REMOVE LISTENERS!!!!!!!! -----Sergio

		stage.removeChild(buildMenu); //Remove Old building menu image --Sergio
		stage.removeChild(loadBuildingButton); //Remove Old building menu image --Sergio
		stage.removeChild(loadDefenseButton); //Sergio
		stage.removeChild(loadZombieButton); //Sergio
		stage.removeChild(closeMenuButton);
	//}
	

	console.log("LOAD BUILDING"); 
	loadBuildingButton.removeEventListener("click", loadBuilding);
	attackButton.addEventListener("click", loadAttack);
	
	var bmp1 = new createjs.Bitmap(queue.getResult("factory1"));  /////Start Sergio code for drag and drop~!
	stage.addChild(bmp1);
	
	//bmp1.addEventListener("click", function(event) { alert("clicked"); })  
	
	//Drag and Drop Function -Sergio
	
	bmp1.on("pressmove", function(evt) {   
	
			console.log(bmp1.x);
			console.log(bmp1.y);
		
	if( (bmp1.x < 590) && (bmp1.y < 568) ) //Sets up basic primitive boundaries -- Sergio
	{
		evt.target.x = evt.stageX;
		evt.target.y = evt.stageY;
	}
			
			
		});
	bmp1.on("pressup", function(evt) {
	
		console.log("up");
		//bmp1.removeEventListener("click", function(event) { alert("clicked"); })
		bmp1.mouseEnabled = false;
	
	})
	

	
	
	
	/////End sergio code for drag and drop~!
	
	attackButton.graphics.beginFill("#000000").drawRect(260, 906, 147, 55);
	stage.addChild(attackButton);
	var bmp = new createjs.Bitmap(queue.getResult("building"));
     //stage.addChild(bmp);
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
	stage.addChild(bmp);
}

function tick(event){
    stage.update();
}