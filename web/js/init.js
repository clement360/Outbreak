var stage;
var queue;
var socket = io.connect("http://compute.cs.tamu.edu:56644");
//please do not delete 
//var socket = io.connect("http://localhost:56644"); 
var userNames = new Array();
var MousePostion = new createjs.Text("X: Y: ", "40px Arial", "black");
var myIndex;
var usersReady = new Array();

socket.on('newUser', function(data) {
	console.log("NEW USER CONNECTED: " + data);
	for(var x = 0; x < 4; ++x) {
		if(userNames[x] == null) {
			userNames[x] = userName.value;
			playerNameText[x].text = data;
			stage.addChild(playerNameText[x]);
			break;
		}
	}
});

socket.on('usersReady', function(data) {
	usersReady = data;
});

socket.on('userLobby', function(data) {
	console.log(data);
	userNames = data;
	var full = true;
	for(var x = 0; x < 4; ++x) {
		if(userNames[x] == null) {
			full = false;
			break;
		}
	}
	if(full) {
		alert("Game server is already full!!!");
		window.location.href = "http://google.com";
	}
	init();
});

socket.on('userDisconnect', function(data) {
	playerNameText[data].text = "";
	stage.addChild(playerNameText[data]);
	delete userNames[data];
	delete usersReady[data];
	checkMarks[data].visible = false;
});

function init(){
	stage = new createjs.Stage("demoCanvas");
	queue = new createjs.LoadQueue(false);
	queue.installPlugin(createjs.Sound);
	queue.addEventListener("complete", loadTitle);
	queue.loadManifest([
		{id:"title", src:"images/title.jpg"}, 
		{id:"lobby", src:"images/lobby.jpg"},
		{id:"battle", src:"images/Battle.jpg"}, 
		{id:"buildMenu", src:"images/buildMenu.png"},
		{id:"lowerMenu", src:"images/lowerMenu.png"},
		{id:"building", src:"images/Building.jpg"}, 
		{id:"field", src:"images/field.jpg"},
		{id:"factory1", src:"images/factory1.png"},
		{id:"defense", src:"images/defense added.jpg"}, 
		{id:"readyCheck", src:"images/readyCheck.png"}
	]);
}

document.onmousemove = function(e){
	// Calibrate x and y
	var x = e.pageX;
	var y = e.pageY;
	MousePostion.text = "X: "+x+"\nY: "+y;
	stage.addChild(MousePostion);
};