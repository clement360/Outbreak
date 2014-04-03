/**
 * Created by Miguel on 4/2/14.
 */



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





//serverGrid Start
var gridWidth = 17;
var gridHeight = 6;

var serverGrid = new Array(gridWidth); ////Grid to be used for game  --Sergio
for (var i = 0; i < gridWidth; i++) {
    serverGrid[i] = new Array(gridHeight);
}

xPlacement = 9;  //Original x placement to populate the grid.
yPlacement = 11;  //    "    y    "


serverGrid[0][0] = new Box(xPlacement,yPlacement);

for (var i = 0; i < gridWidth; i++) {
    if(i == 0)
        for (var k = 1; k < gridHeight; k++) {
            yPlacement = yPlacement + 111.25;
            serverGrid[i][k] = new Box(xPlacement, yPlacement);
        }
    else
    {
        for (var k = 0; k < gridHeight; k++)
        {
            if( k == 0 )
            {
                yPlacement = -100.25;
            }
            yPlacement = yPlacement + 111.25;
            serverGrid[i][k] = new Box(xPlacement, yPlacement);
        }
    }
    xPlacement = xPlacement + 111.25;
    yPlacement = 11;
}
//serverGrid End