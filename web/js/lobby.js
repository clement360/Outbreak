var readyButton = new createjs.Shape();
var playerNameText = new Array();
var checkMarks = new Array();

socket.on('userReady', function(data) {
	usersReady[data] = true;
	if(currentState == state["lobby"]) {
		setCheck(data);
		checkUsersReady();
	}
});

socket.on("index", function(data) {
	myIndex = data;
	userNames[data] = userName.value;
	playerNameText[data].text = userName.value;
	stage.addChild(playerNameText[data]);
});

function checkUsersReady() {
	var userNotReady = false;
	for(var x = 0; x < 4; ++x) {
		if(!usersReady[x]) {
			userNotReady = true;
			break;
		}
	}
	if(!userNotReady)
		loadFort(this);
}

function setCheck(player) {
	checkMarks[player] = new createjs.Bitmap(queue.getResult("readyCheck"));
	checkMarks[player].x = 1750;
	switch(player) {
		case 0:
			checkMarks[player].y = 180;
			break;
		case 1:
			checkMarks[player].y = 346;
			break;
		case 2:
			checkMarks[player].y = 510;
			break;
		case 3:
			checkMarks[player].y = 670;
			break;
	}
	stage.addChild(checkMarks[player]);
}

function readyUp(event) {
	socket.emit('readyUp', myIndex);
	setCheck(myIndex);
	usersReady[myIndex] = true;
	checkUsersReady();
}

function loadLobby(event) {
	currentState = state["lobby"];
	var newUserForm = document.getElementById("newUserForm");
	newUserForm.style.display = "none";
	stage.removeChild(startButton);
	socket.emit('userName', userName.value);
	playerNameText[0] = new createjs.Text(userNames[0], "bold 60px Lithos", "#00754f");
	playerNameText[1] = new createjs.Text(userNames[1], "bold 60px Lithos", "#00754f");
	playerNameText[2] = new createjs.Text(userNames[2], "bold 60px  Lithos", "#7d4a00");
	playerNameText[3] = new createjs.Text(userNames[3], "bold 60px Lithos", "#7d4a00");
	playerNameText[0].x = 160;
	playerNameText[0].y = 200;
	playerNameText[1].x = 160;
	playerNameText[1].y = 360;
	playerNameText[2].x = 160;
	playerNameText[2].y = 530;
	playerNameText[3].x = 160;
	playerNameText[3].y = 700;
	console.log("LOAD LOBBY"); 
	startButton.removeEventListener("click", loadLobby);
	readyButton.addEventListener("click", readyUp);
	readyButton.graphics.beginFill("#000000").drawRect(770, 835, 430, 120);
	var bmp = new createjs.Bitmap(queue.getResult("lobby"));
	stage.addChild(readyButton);
	stage.addChild(bmp);
	for(var x = 0; x < 4; ++x) {
		if(usersReady[x])
			setCheck(x);
	}
	stage.addChild(playerNameText[0]);
	stage.addChild(playerNameText[1]);
	stage.addChild(playerNameText[2]);
	stage.addChild(playerNameText[3]);
}