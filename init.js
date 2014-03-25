var stage;
var queue;
var io = require('socket.io');

function init(){
	stage = new createjs.Stage("demoCanvas");
	queue = new createjs.LoadQueue(false);
	queue.installPlugin(createjs.Sound);
	queue.addEventListener("complete", loadTitle);
	queue.loadManifest([{id:"title", src:"title.jpg"}, {id:"lobby", src:"lobby.jpg"},
	{id:"battle", src:"Battle.jpg"}, {id:"lobby", src:"lobby.jpg"}, {id:"menu", src:"Build menu.jpg"},
	{id:"building", src:"Building.jpg"}, {id:"fort", src:"Fort layout.jpg"},
	{id:"defense", src:"defense added.jpg"}]);
}

document.onmousemove = function(e){
	var x = e.pageX;
	var y = e.pageY;
	MousePostion.text = "X: "+x+"\nY: "+y;
	stage.addChild(MousePostion);
};