var startButton = new createjs.Shape();
var MousePostion = new createjs.Text("X: Y: ", "40px Arial", "black");

function loadTitle(event){
	createjs.Ticker.addEventListener("tick", tick)
	startButton.graphics.beginFill("#000000").drawRect(740, 560, 520, 200);
    startButton.addEventListener("click", loadLobby);
	stage.addChild(startButton);
	var bmp = new createjs.Bitmap(queue.getResult("title"));
	stage.addChild(bmp);
}
