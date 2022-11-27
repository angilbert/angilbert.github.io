
var stepChar = new Array (['\\','N','/'],['W','-','E'],['<','S','>']);
var curX, curY, goals;
var moveSeq;

function initToggleMaze(x,y,g) {
   curX = x; curY = y;     // start position
   goals = g;              // goal count
   moveSeq = "";
}

function clickNW(id) { return ( clickEvent(id, -1,-1) ); };
function clickN(id)  { return ( clickEvent(id, 0,-1) ); };
function clickNE(id) { return ( clickEvent(id, 1,-1) ); };
function clickW(id)  { return ( clickEvent(id, -1,0) ); };
function click0(id)  { return ( clickEvent(id, 0,0) ); };
function clickE(id)  { return ( clickEvent(id, 1,0) ); };
function clickSW(id) { return ( clickEvent(id, -1,1) ); };
function clickS(id)  { return ( clickEvent(id, 0,1) ); };
function clickSE(id) { return ( clickEvent(id, 1,1) ); };

function clickEvent(buttonId, dx,dy) 
{
    var nx = curX + dx; 
    var ny = curY + dy;
    var curCell = document.getElementById("M"+curX+curY);
    var nextCell = document.getElementById("M"+nx+ny);
    var pressed = document.getElementById(buttonId);

    if (nextCell == undefined) 
        { alert("Invalid move - stay on the grid"); return; }

    // use the button text to identify the action and target
    var buttext = pressed.textContent;
    var action = "tog";
    var target = "red";
    if ( buttext.includes("disable") ) { action = "off" }
    if ( buttext.includes("enable") ) { action = "on" }
    if ( buttext.includes("green") ) { target = "gre" }
    if ( buttext.includes("blue") ) { target = "blu" }
    if ( buttext.includes("yellow") ) { target = "yel" }

    // toggle/disable buttons and then disable current button
    updateClassSet(action, target); 
    pressed.disabled = true;

    // check for goal reached
    moveSeq += ""+stepChar[dy+1][dx+1];
    if ( nextCell.src.includes("goal.png") ) { goals--; }

    // update grid
    curCell.src = "./_img/w2424.png";      // consumes goal
    nextCell.src = "./_img/mover.png";
    curX=nx; curY=ny;

    // check for win condition
    if (goals == 0) { 
        setTimeout(function() { alert("Hurrah! You did it!"); }, 100);
        // console.log("moveSeq: "+moveSeq);
        // moveSeq:/WENES<W<NE/S>W<NE/SW>N\<ESWN\<ESWN/\ESWNE\
    }
}

function updateClassSet(act, cls) {
    var elements = document.getElementsByClassName(cls);
    Array.prototype.forEach.call(elements, function(butt) { 
            var state = butt.disabled;
            if ( act == 'off') { butt.disabled = true; }
            if ( act == 'on' ) { butt.disabled = false; }
            if ( act == 'tog') { butt.disabled = !state; }
        });
}
