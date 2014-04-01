var stage;
var queue;
var socket = io.connect("http://compute.cs.tamu.edu:56644");
//please do not delete 
//var socket = io.connect("http://localhost:56644");
var userNames = new Array();
var myIndex;
var usersReady = new Array();
var state = {
    "splash" : 0,
    "lobby" : 1,
    "game" : 2
};
var currentState = 0;

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
        {id:"battle", src:"images/Battle.jpg"},
        {id:"buildMenu", src:"images/buildMenu.png"},
        {id:"lowerMenu", src:"images/lowerMenu.png"},
        {id:"building", src:"images/Building.jpg"},
        {id:"field", src:"images/field.jpg"},
        {id:"factory1", src:"images/factory1.png"},
        {id:"defense", src:"images/defense added.jpg"},
        {id:"readyCheck", src:"images/readyCheck.png"},
        {id:"zombiesMenu", src:"images/zombiesMenu.png"},
        {id:"defensesMenu", src:"images/defensesMenu.png"},
        {id:"buildingsMenu", src:"images/buildingsMenu.png"},
        {id:"exitButton", src:"images/exit.png"}
    ]);
}
