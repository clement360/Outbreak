var stage;
var queue;
var socket = io.connect("http://compute.cs.tamu.edu:56644");

socket.on('news', function(data) {
		  console.log(data['hello']);
		  });

function init(){
	socket.emit('blarg', {what: 'is up'});
	stage = new createjs.Stage("demoCanvas");
	queue = new createjs.LoadQueue(false);
	queue.installPlugin(createjs.Sound);
	queue.addEventListener("complete", loadTitle);
	queue.loadManifest([{id:"title", src:"images/title.jpg"}, {id:"lobby", src:"images/lobby.jpg"},
	{id:"battle", src:"images/Battle.jpg"}, {id:"lobby", src:"images/lobby.jpg"}, {id:"menu", src:"images/Build menu.jpg"},
	{id:"building", src:"images/Building.jpg"}, {id:"fort", src:"images/Fort layout.jpg"},
	{id:"defense", src:"images/defense added.jpg"}]);
}

document.onmousemove = function(e){
	var x = e.pageX;
	var y = e.pageY;
	MousePostion.text = "X: "+x+"\nY: "+y;
	stage.addChild(MousePostion);
};