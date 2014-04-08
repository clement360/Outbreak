var startButton = new createjs.Shape();
var carl;
var zombies = [];

function promptUserName() {
	var newUserForm = document.getElementById("newUserForm");
	newUserForm.style.display = "block";
}

function loadTitle(event){
	createjs.Ticker.addEventListener("tick", tick)
	startButton.graphics.beginFill("#000000").drawRect(740, 560, 520, 200);
    startButton.addEventListener("click", promptUserName);
	stage.addChild(startButton);
	var bmp = new createjs.Bitmap(queue.getResult("title"));
	stage.addChild(bmp);

	var greenZombie = new createjs.Bitmap(queue.getResult("greenZombie"));
	var blueZombie = new createjs.Bitmap(queue.getResult("blueZombie"));
	var blueKing = new createjs.Bitmap(queue.getResult("blueKing"));
	var greenKing = new createjs.Bitmap(queue.getResult("greenKing"));
	for(var h = 0; h < 10; h++){
		carl = new Zombie(50, 98*h+10, h, greenZombie);
		zombies.push(carl);
	}
}
