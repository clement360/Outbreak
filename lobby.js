var readyButton = new createjs.Shape();
		
function loadLobby(event){
	console.log("LOAD LOBBY"); 
	startButton.removeEventListener("click", loadLobby);
	readyButton.addEventListener("click", loadFort);
	readyButton.graphics.beginFill("#000000").drawRect(770, 835, 430, 120);
	stage.addChild(readyButton);
	var bmp = new createjs.Bitmap(queue.getResult("lobby"));
  	stage.addChild(bmp);
}