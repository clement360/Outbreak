var startButton = new createjs.Shape();

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
}
