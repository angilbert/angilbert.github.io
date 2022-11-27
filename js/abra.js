var mazeSeq = "ABCA";
var imgDir="./_img/";
var curX,curY,finX,finY;
var stepCo;


function initAbraMaze( rows,cols,sx,sy,fx,fy,enc,seq ) {
    mazeSeq = seq;
    curX = sx; curY = sy;   // start cell
    finX = fx; finY = fy;   // finish cell
    stepCo = 0;
    var x=0, y=0;
    for (var i=0; i<enc.length; i++) {
        var c = enc.charAt(i);
        //console.log("xy: "+x+y+"/"+c);
        updatePng( x,y,c, (x==sx && y==sy) ); 
        if (++x == cols) { x=0; y++; }
        if (y == rows) { break; }   
    }
}

function updatePng(mx,my,c,selected) 
{
    var el = document.getElementById("M"+mx+my);
    //console.log("updatePng for: "+el.id+" :"+selected);

    if ( selected ) { el.classList.add("selected");}
    else            { el.classList.remove("selected");}
    if ( c == '-' ) { el.src = imgDir+"blank.png"; }
    else            { el.src = imgDir+"abra"+c+".png"; }
}

function touchImg(elemId) 
{ 
    var imgStr = document.getElementById(elemId).src;
    var imgSrc = imgStr.split('/').pop();
    
    // use the id to get the x/y position
    var nx = elemId.charAt(1);
    var ny = elemId.charAt(2);

    if ( stepCo >= (mazeSeq.length)-1 )
        { alert("Stuck? Reload to retry"); return; } 
    if ( nx!=curX && ny!=curY )
        { alert("Stay in row or column"); return; }

    var wantC = mazeSeq.charAt(stepCo+1);
    var gotC = imgSrc.charAt(4);  // Z from abraZ.png
    if ( gotC != wantC )
        { alert("Next letter must be "+wantC); return; } 

    // update status and check for win
    updatePng(curX,curY, mazeSeq.charAt(stepCo), false );
    updatePng(nx,ny, mazeSeq.charAt(stepCo+1), true );
    stepCo++; curX=nx; curY=ny;

    if (stepCo==(mazeSeq.length)-1) {
        if (curX==finX && curY==finY)
            setTimeout(function() { alert("Hurrah! You did it!"); }, 100);
        else { alert("You must finish on the bottom A"); } 
    }
}



