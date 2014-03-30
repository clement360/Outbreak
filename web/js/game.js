var buildButton = new createjs.Shape();
var loadBuildingButton = new createjs.Shape();
var attackButton = new createjs.Shape();
var users = new Array();

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
	loadBuildingButton.graphics.beginFill("#000000").drawRect(355, 235, 1135, 300);
	stage.addChild(loadBuildingButton);
	var buildMenu = new createjs.Bitmap(queue.getResult("buildMenu"));

	buildMenu.x = 310;
	buildMenu.y = 90;

	stage.addChild(buildMenu);
}
		
function loadBuilding(event){
	console.log("LOAD BUILDING"); 
	loadBuildingButton.removeEventListener("click", loadBuilding);
	attackButton.addEventListener("click", loadAttack);
	attackButton.graphics.beginFill("#000000").drawRect(260, 906, 147, 55);
	stage.addChild(attackButton);
	var bmp = new createjs.Bitmap(queue.getResult("building"));
     stage.addChild(bmp);
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