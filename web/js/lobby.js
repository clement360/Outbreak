var readyButton = new createjs.Shape();
var playerNameText = new Array();;

function setCheck(player) {
	var bmp = createjs.Bitmap(queue.getResult("readyCheck"));
	bmp.x = 1800;
	switch(player) {
		case 0:
			bmp.y = 180;
			break;
		case 1:
			bmp.y = 340;
			break;
		case 2:
			bmp.y = 500;
			break;
		case 3:
			bmp.y = 670;
			break;
	}
	stage.addChild(bmp);
}

function readyUp() {
	socket.emit('readyUp', myIndex);
	var bmp = createjs.Bitmap(queue.getResult("readyCheck"));
}

function loadLobby(event) {
	var newUserForm = document.getElementById("newUserForm");
	newUserForm.style.display = "none";
	socket.emit('userName', userName.value);
	for(var x = 0; x < 4; ++x) {
		if(userNames[x] == null) {
			userNames[x] = userName.value;
			myIndex = x;
			break;
		}
	}
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
	stage.addChild(readyButton);
	var bmp = new createjs.Bitmap(queue.getResult("lobby"));
  	stage.addChild(bmp);
	stage.addChild(playerNameText[0]);
	stage.addChild(playerNameText[1]);
	stage.addChild(playerNameText[2]);
	stage.addChild(playerNameText[3]);
}