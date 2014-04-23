var startButton = new createjs.Shape();
var greenZombie;
var blueZombie;
var blueKing;
var greenKing;

function promptUserName() {
	var newUserForm = document.getElementById("newUserForm");
	newUserForm.style.display = "block";
}

function loadTitle(event){
	clearInterval(wheelInterval);
	stage.removeChild(loadText);
	stage.removeChild(loadDetailText);
	stage.removeChild(loadWheel);
	startButton.graphics.beginFill("#000000").drawRect(740, 560, 520, 200);
    startButton.addEventListener("click", promptUserName);
	stage.addChild(startButton);
	var bmp = new createjs.Bitmap(queue.getResult("title"));
	stage.addChild(bmp);

	// Leave this here, needed for debugging
	greenZombie = new createjs.Bitmap(queue.getResult("greenZombie"));
	blueZombie = new createjs.Bitmap(queue.getResult("blueZombie"));
	blueKing = new createjs.Bitmap(queue.getResult("blueKing"));
	greenKing = new createjs.Bitmap(queue.getResult("greenKing"));
}
