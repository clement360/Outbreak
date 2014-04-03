/**
 * Created by Miguel on 4/2/14.
 */

var EasyStar = require('easystarjs');
var easystar = new EasyStar.js();

//User Class
function User(userName) {
    this.name = userName;
    this.ready = false;
    this.money = 0;
}

function Box(x,y) {
    this.x = x;
    this.y = y;
    this.occupied = false;
}

// coorGrid is used as reference when converting
// pixels to pathGrid Coordinates
var coorGrid = new Array(33);
for (var i = 0; i <= 32; i++) {
    coorGrid[i] = new Array(12);
}
coorGrid[0][0] = new Box(38,33);
var xPlacement = 38;  //Original x placement to populate the grid.
var yPlacement = 33;
for (var i = 0; i < 33; i++) {
    if(i == 0)
        for (var k = 1; k < 12; k++) {

            yPlacement = yPlacement + 56.5;
            coorGrid[i][k] = new Box(xPlacement, yPlacement);
        }
    else
    {
        for (var k = 0; k < 12; k++)
        {
            if( k == 0 )
            {
                yPlacement = -23.5;
            }
            yPlacement = yPlacement + 56.5;
            coorGrid[i][k] = new Box(xPlacement, yPlacement);
        }
    }
    xPlacement = xPlacement + 55.9;
    yPlacement = 33;
}
//coorGrid End



// grid that is used for pathfinding with EasyStar 33 x 12
var pathGrid = new Array(32);
for (var i = 0; i <= 32; i++) {
    pathGrid[i] = new Array(12);
    for(var j = 0; j <= 11; j++){
        pathGrid[i][j] = 0;
    }
}

easystar.setGrid(pathGrid);
easystar.enableDiagonals();
easystar.setAcceptableTiles([0]);