
stepChar = new Array (['\\','N','/'],['W','-','E'],['<','S','>']);
var cx, cy, sz, goals;
var moveSeq;

function initToggleMaze(x,y,z,g) {
   cx = x ; cy = y;     // start position
   sz = z;              // grid dimension (not used)
   goals = g;           // goal count
   moveSeq = "";
}

function clickEvent(bx,by, dx,dy, action, target) 
{
    // action: on, off, tog 
    // target: blu, red, gre, adj, col, row 

    var pressed = document.getElementById("B"+bx+by);

    var nx = cx + dx; 
    var ny = cy + dy;
    var curCell = document.getElementById("M"+cx+cy);
    var nextCell = document.getElementById("M"+nx+ny);

    if (nextCell == undefined) 
        { alert("Invalid move - stay on the grid"); return; }

    if (target == 'row') {
        updateButt(action, 0, by); 
        updateButt(action, 1, by);
        updateButt(action, 2, by); 
    }
    else if (target == 'col') {
        updateButt(action, bx, 0); 
        updateButt(action, bx, 1);
        updateButt(action, bx, 2); 
    }
    else if (target == 'adj') {
        updateButt(action, bx-1, by); 
        updateButt(action, bx+1, by);
        updateButt(action, bx, by-1); 
        updateButt(action, bx, by+1);
    }
    // else target is a color/class
    else { updateClassSet(action, target); }

    // check for goal reached
    moveSeq += ""+stepChar[dy+1][dx+1];
    if ( nextCell.src.includes("goal.png") ) { goals--; }

    // disable current button and update the maze
    pressed.disabled = true;
    curCell.src = "blank.png";      // consumes goal
    nextCell.src = "mover.png";
    cx=nx; cy=ny;

    // check for win condition
    if (goals == 0) { alert("Hurrah! You did it!"); return; }

    // console.log("moveSeq: "+moveSeq);
    // moveSeq:/WENES<W<NE/S>W<NE/SW>N\<ESWN\<ESWN/\ESWNE\
}

function updateButt(action, bx, by) {
    var butt = document.getElementById("B"+bx+by);
    if (butt == undefined) return;  // bx or by invalid 
    var state = butt.disabled;
    if ( action == 'off') { butt.disabled = true; }
    if ( action == 'on' ) { butt.disabled = false; }
    if ( action == 'tog') { butt.disabled = !state; }
}

function updateClassSet(action, c) {
    var elements = document.getElementsByClassName(c);
    Array.prototype.forEach.call(elements, function(butt) { 
            var state = butt.disabled;
            if ( action == 'off') { butt.disabled = true; }
            if ( action == 'on' ) { butt.disabled = false; }
            if ( action == 'tog') { butt.disabled = !state; }
        });
}
