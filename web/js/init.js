var stage;
var queue;
var socket = io.connect(server);
var userNames = new Array();
var myIndex;
var usersReady = new Array();
var state = {
    "splash" : 0,
    "lobby" : 1,
    "game" : 2
};
var currentState = 0;

//This needs to be set here or load might crash
var loadText = new createjs.Text("Awaiting server connection...", "bold 60px Lithos", "#FFFFFF");
loadText.x = 400;
loadText.y = 350;

var loadDetailText;
var loadWheel;
var wheelInterval;

//Box class for grid
function Box(x,y) {
    this.x = x;
    this.y = y;
    this.occupied = false;
}

//Keep retrying until we are connected
socket.on('error', function (err) {
	socket.socket.reconnect();
});

socket.on('disconnect', function(data) {
	stage.removeAllChildren();
	stage.removeAllEventListeners();
	loadText.text = "Lost connection to server.";
	loadText.x = 450;
	loadText.y = 450;
	stage.addChild(loadText);
});

socket.on('newUser', function(data) {
    console.log("NEW USER CONNECTED: " + data);
    userNames[data["index"]] = data["userName"]
    if(currentState == state["lobby"]) {
        playerNameText[data["index"]].text = data["userName"];
        stage.addChild(playerNameText[data["index"]]);
	}
});

var loaded = false;
socket.on('initialData', function(data) {
	userNames = data["userNames"];
	usersReady = data["usersReady"];
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
	if(!loaded) {
		loaded = true;
		load();
	}
});

socket.on('userDisconnect', function(data) {
	playerNameText[data].text = "";
	stage.addChild(playerNameText[data]);
	delete userNames[data];
	delete usersReady[data];
	checkMarks[data].visible = false;
});

function init() {
	stage = new createjs.Stage("demoCanvas");
	createjs.Ticker.addEventListener("tick", function() {
		stage.update();
	});
	
	loadDetailText = new createjs.Text("", "bold 45px Lithos", "#FFFFFF");
	loadDetailText.textAlign = "center"
	loadDetailText.x = 950;
	loadDetailText.y = 450;
	
	loadWheel = new createjs.Bitmap("images/loadWheel.png");
	loadWheel.regX = 104;
	loadWheel.regY = 103;
	loadWheel.x = 970;
	loadWheel.y = 650;
	
	wheelInterval = setInterval(function() {
		loadWheel.rotation = 0;
		createjs.Tween.get(loadWheel).to({rotation:359}, 1000);
	},1000);
	
	stage.addChild(loadText);
	stage.addChild(loadDetailText);
	stage.addChild(loadWheel);
}

var lastSoundId = "turretShotFired";
function handleLoad(event) {
	if(event.id != null) {
		loadDetailText.text = "Loaded: " + event.id;
		if(event.id == lastSoundId) {
			loadImages();
		}
	}
	else
		loadDetailText.text = "Loaded: " + event.item.id;
}


function load(){
    queue = new createjs.LoadQueue(false);
	
	//Load sounds
	loadText.text = "Loading sounds...";
	loadText.x = 650;
    queue.installPlugin(createjs.Sound);
	createjs.Sound.alternateExtensions = ["wav"];
	var soundManifest = [
		{src:"sounds/zombieAttack.wav", id:"zombieAttack"},
		{src:"sounds/zombieDied.wav", id:"zombieDied"},
		{src:"sounds/buildingDestroyed.wav", id:"buildingDestroyed"},
		{src:"sounds/buildingPlaced.wav", id:"buildingPlaced"},
		{src:"sounds/smallZombiePlaced.wav", id:"smallZombiePlaced"},
		{src:"sounds/kingZombiePlaced.wav", id:"kingZombiePlaced"},
		{src:"sounds/victory.wav", id:"victory"},
		{src:"sounds/youLose.wav", id:"youLose"},
		//We only want to have one of this at a time (or it sounds nasty :D)
		{src:"sounds/flames.mp3", id:"flames", data:1},
		{src:"sounds/orbShotFired.mp3", id:"orbShotFired"},
		{src:"sounds/turretShotFired.mp3", id:lastSoundId}
	];
	createjs.Sound.registerManifest(soundManifest);
	createjs.Sound.addEventListener("fileload", handleLoad);
}

function loadImages() {
	//Load images
	loadText.text = "Loading images...";
	queue.addEventListener("complete", loadTitle);
	queue.addEventListener("fileload", handleLoad);
    queue.loadManifest([
						{id:"title", src:"images/title.jpg"},
						{id:"lobby", src:"images/lobby.jpg"},
						{id:"buildMenu", src:"images/buildMenu.png"},
						{id:"lowerMenu", src:"images/lowerMenu.png"},
						{id:"field", src:"images/field.jpg"},
						{id:"factory", src:"images/factory1.png"},
						{id:"readyCheck", src:"images/readyCheck.png"},
						{id:"zombiesMenu", src:"images/zombiesMenu.png"},
						{id:"defensesMenu", src:"images/defensesMenu.png"},
						{id:"buildingsMenu", src:"images/buildingsMenu.png"},
						{id:"exitButton", src:"images/exit.png"},
						{id:"noticeBox", src:"images/noticeBox.png"},
						{id:"greenKing", src:"images/greenKing.png"},
						{id:"blueKing", src:"images/blueKing.png"},
						{id:"greenZombie", src:"images/greenZombie.png"},
						{id:"blueZombie", src:"images/blueZombie.png"},
						{id:"doneButton", src:"images/doneButton.png"},
						{id:"turret", src:"images/turret.png"},
						{id:"orb", src:"images/orb.png"},
						{id:"highlightGrid", src:"images/highlightGrid.png"},
						{id:"leftBase", src:"images/leftBase.png"},
						{id:"rightBase", src:"images/rightBase.png"},
						{id:"cage", src:"images/cage.png"},
						{id:"explosion", src:"images/explosion.png"},
						{id:"healthCover", src:"images/healthCover.png"},
						{id:"30Fps", src:"images/30Fps.png"},
						{id:"45Fps", src:"images/45Fps.png"},
						{id:"60Fps", src:"images/60Fps.png"},
						{id:"soundOff", src:"images/soundOff.png"},
						{id:"soundOn", src:"images/soundOn.png"},
						{id:"settings", src:"images/settings.png"},
						{id:"bank", src:"images/bank.png"},
						{id:"bullet", src:"images/bullet.png"},
						{id:"burst", src:"images/burst.png"},
						{id:"bullet", src:"images/bullet.png"},
						{id:"burst", src:"images/burst.png"},
						{id:"rightFight", src:"images/rightFight.png"},
						{id:"leftFight", src:"images/leftFight.png"},
						{id:"smallHealthBase", src:"images/smallHealthBase.png"},
						{id:"smallRedHealth", src:"images/smallRedHealth.png"}
						]);
	createjs.Ticker.setFPS(60);
}
