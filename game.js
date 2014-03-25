var buildButton = new createjs.Shape();
var loadBuildingButton = new createjs.Shape();
var attackButton = new createjs.Shape();

function loadFort(event){
	console.log("LOAD FORT"); 
	readyButton.removeEventListener("click", loadFort);
	buildButton.addEventListener("click", loadMenu);
	buildButton.graphics.beginFill("#000000").drawRect(260, 835, 137, 45);
	stage.addChild(buildButton);
	var bmp = new createjs.Bitmap(queue.getResult("fort"));
	stage.addChild(bmp);
}
		
function loadMenu(event){
	console.log("LOAD MENU"); 
	buildButton.removeEventListener("click", loadMenu);
	loadBuildingButton.addEventListener("click", loadBuilding);
	loadBuildingButton.graphics.beginFill("#000000").drawRect(355, 235, 1135, 300);
	stage.addChild(loadBuildingButton);
	var bmp = new createjs.Bitmap(queue.getResult("menu"));
	stage.addChild(bmp);
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