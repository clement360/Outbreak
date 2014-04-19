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

//Box class for grid
function Box(x,y) {
    this.x = x;
    this.y = y;
    this.occupied = false;
}

socket.on('newUser', function(data) {
    console.log("NEW USER CONNECTED: " + data);
    userNames[data["index"]] = data["userName"]
    if(currentState == state["lobby"]) {
        playerNameText[data["index"]].text = data["userName"];
        stage.addChild(playerNameText[data["index"]]);
    }
});

socket.on('initialData', function(data) {
    console.log(data);
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
	createjs.Sound.alternateExtensions = ["wav"];
	createjs.Sound.registerSound("sounds/zombieAttack.wav", "zombieAttack");
	createjs.Sound.registerSound("sounds/zombieDied.wav", "zombieDied");
	createjs.Sound.registerSound("sounds/buildingDestroyed.wav", "buildingDestroyed");
	createjs.Sound.registerSound("sounds/buildingPlaced.wav", "buildingPlaced");
	createjs.Sound.registerSound("sounds/smallZombiePlaced.wav", "smallZombiePlaced");
	createjs.Sound.registerSound("sounds/kingZombiePlaced.wav", "kingZombiePlaced");
	createjs.Sound.registerSound("sounds/victory.wav", "victory");
	createjs.Sound.registerSound("sounds/youLose.wav", "youLose");
	//createjs.Sound.registerSound("sounds/flames.mp3", "flames");
	//We only want to have one of this at a time (or it sounds nasty :D)
	createjs.Sound.registerSound("sounds/flames.mp3", "flames", 1);
	createjs.Sound.registerSound("sounds/orbShotFired.mp3", "orbShotFired");
	createjs.Sound.registerSound("sounds/turretShotFired.mp3", "turretShotFired");
	createjs.Ticker.setFPS(60);
}
