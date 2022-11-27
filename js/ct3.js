var gridSz=4;
var currentPuzz=null;
var currentPuzzBH=null;
var currentTitle="No title";
var pirateEl=null;
var solnStr="";
var undoStr="";
var solved=false;
var CKenabled=false;
var warningsEnabled=true;
var autoUp=false;
var dMode=false;

var maxPack=6;
var curPack=null;
var curTitles=null;
var level=0;
var pack=1;

////////////////////////////////////////////////////////////////////////////////////
// Initialisation & puzzle loading functions
////////////////////////////////////////////////////////////////////////////////////

function disableWarnings()    { warningsEnabled = false; }
function autoLevelUp(boolVal) { autoUp = boolVal; }
function warnAlert(str)       { if (warningsEnabled) { alert(str); } }

function devMode() {
  revealByClass('dev-panel');
  autoLevelUp(false);
  dMode=true;
}

function levelSelect(c) {
  var z = curPack.length-1;
  if ( c=='-' && level>1 ) { level--; }
  else if ( c=='+' && level<z ) { level++; }
  else if ( c=='+' && level==z ) { packSelect('+'); }
  updateButtonSet( (level==z), "levelU" );
  updateButtonSet( (level==1), "levelD" );
  var str=" ["+level+"/"+z+"]";
  var title=curTitles[level]+str;
  if (!dMode && pack>2) { title=str; }
  loadPuzz(null, curPack[level], title);
}

function packSelect(c) {
  pack+=(c=='+'?1:-1);
  if (pack<1 || pack>maxPack) { pack=1; }
  if (pack==1) { curPack=p1Encs; curTitles=p1Titles; } 
  if (pack==2) { curPack=p2Encs; curTitles=p2Titles; } 
  if (pack==3) { curPack=p3Encs; curTitles=p3Titles; } 
  if (pack==4) { curPack=p4Encs; curTitles=p4Titles; } 
  if (pack==5) { curPack=p5Encs; curTitles=p5Titles; } 
  if (pack==6) { curPack=p6Encs; curTitles=p6Titles; } 
  updateButtonSet( (pack==maxPack), "packU" );
  updateButtonSet( (pack==1), "packD" );
  //var str=" ("+pack+"/"+maxPack+")";
  document.getElementById("p-pack").innerHTML="Pack: "+curPack[0];
  level=0; levelSelect('+');
  if (pack>1) { disableWarnings(); }
}

function revealByClass(cls) {    
    var set = document.getElementsByClassName(cls);
    Array.prototype.forEach.call(set, function(el) { 
        el.style.visibility = "visible"; 
        el.style.display = "block";
    });
}

function updateButtonSet(boolVal, cls) {
  // console.log("updateButtonSet:"+boolVal+" "+cls);
    var set = document.getElementsByClassName(cls);
    Array.prototype.forEach.call(set, function(butt) 
        { butt.disabled = boolVal; });
}

function flushGC() {     
    var set = document.getElementsByClassName("gc");
    Array.prototype.forEach.call(set, function(el) { 
      el.className = "gc water"; 
      updateEmoji(el);
    });
}

function reload() { 
  var str;
  var enc = document.getElementById('puzzEnc').value;
  console.log("reload: "+enc);
  if (enc !== currentPuzz && enc !== currentPuzzBH) 
      { str = currentTitle+"#" }
  if (!loadPuzz(null, enc, str)) { 
    alert ("bad puzzle encoding - ignored"); 
  }
}

function loadPuzz(butEl, baseEnc, title) {      
  console.log("loadPuzz "+baseEnc);
  var enc=baseEnc;        // baseEnc may be AG or BH

  if (baseEnc[0] == ':' || baseEnc[0] =='0') {
    currentPuzzBH = baseEnc;
    enc = loadPuzzBH(baseEnc); 
  }
  else { 
    currentPuzz = baseEnc; 
    currentPuzzBH = null; 
  }
  if (enc == null) { return false; }    
       
  flushGC();
  solnStr="";
  undoStr="";
  solved=false;

  // enc is now AG
  // eg: P00T00X44S01S30S14S43
  console.log("loadAG: "+enc);
  for (var i=0; i<enc.length; i+=3) {
      var c = enc.charAt(i);
      var x = enc.charAt(i+1);
      var y = enc.charAt(i+2);
      el = document.getElementById("M"+x+y);
      if (el == undefined) { return false; }

      // T = treasure raft (strong enough to lift treasure)
      // R = grass raft (too weak to lift treasure)
      if (c == 'R' || c == 'T' ) { 
        el.classList.add("raft"); 
        el.classList.remove("water");  
      }
      if (c == 'S' ) {  // safe ground
        el.classList.add("safe"); 
        el.classList.remove("water");  
      }
      if (c == 'P') { 
        el.classList.add("pirate"); 
        pirateEl = el;
      }
      if (c == '!') { el.classList.add("danger"); }
      if (c == 'T') { el.classList.add("strong"); }
      if (c == 'X') { el.classList.add("goal"); }

      // hidden-treasure (not supported)
      // if (c == 'U') { el.classList.add("treasure"); } 
      updateEmoji(el); 
    }

    if ( butEl != null ) 
      { currentTitle = butEl.innerHTML; }
    else if ( title != undefined ) 
      { currentTitle = title; }

    document.getElementById('puzzEnc').value=baseEnc;
    document.getElementById('solnStr').value="";
    document.getElementById('moveCount').innerHTML='0';
    document.getElementById("p-titleA").innerHTML = currentTitle;
    //document.getElementById("p-titleB").innerHTML = currentTitle;
    document.getElementById("undo").disabled = true;
    document.getElementById("redo").disabled = true;
    return true;
}

xVal55 = new Array (0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4);
yVal55 = new Array (0,0,0,0,0,1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,4,4,4,4,4);
xVal44 = new Array (0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3);
yVal44 = new Array (0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3);

function loadPuzzBH(enc) {      // :000DN55->=PTKCK-J
  // console.log("loadBH [ "+enc+ " ]");
  var sz=4;
  var i=0, z=0, part=1;
  var obj="", agEnc="";

  // T = treasure raft (strong enough to lift treasure)
  // R = grass raft (too weak to lift treasure)
  // If there are no T rafts then all rafts are T rafts
  var tChar='T', rChar='T';

  for (var i=0; i<enc.length; i++) 
  {
    var c = enc.charAt(i);
    if (c == ' ') { continue; }
    if (c == '.') { part++; continue; }
    if ( part == 1 ) {   // objects
      switch (c) {
        case ':': obj+=tChar; rChar='R'; break;   
        case '0': obj+=rChar; break;
        case 'D': obj+='S'; break;
        case 'N': obj+='!'; break;
        case '3': sz=3; i++; break;
        case '4': sz=4; i++; break;
        case '5': sz=5; i++; break;
      }
    }
    else {              // locations 
      if (part == 3)             { agEnc+='X'; }
      else if (z == obj.length)  { agEnc+='P'; }
      else                       { agEnc+=obj[z++]; }
      var v = enc.charCodeAt(i) - 60;
      if (sz == 4) 
            { agEnc+=xVal44[v]; agEnc+=yVal44[v]; }
      else  { agEnc+=xVal55[v]; agEnc+=yVal55[v]; }
    }
  }
  //var ok = loadPuzz(butEl, agEnc, "user-defined");
  //document.getElementById('puzzEnc').value=enc; 
  return agEnc;
}

////////////////////////////////////////////////////////////////////////////////////
// Event handling functions
////////////////////////////////////////////////////////////////////////////////////

// cursor-key event handler (fake a mouse-click) 
function enableCK() {
  if (CKenabled) { return; }
  document.addEventListener('keydown', function(ev) {
    var x,y;
    switch (ev.key) {
      case "ArrowLeft":  x=-1; y= 0; ev.preventDefault(); break; 
      case "ArrowRight": x= 1; y= 0; ev.preventDefault(); break; 
      case "ArrowUp":    x= 0; y=-1; ev.preventDefault(); break; 
      case "ArrowDown":  x= 0; y= 1; ev.preventDefault(); break; 
      default: return; 
    }
    if (validateMove(x,y)) { applyMove(false,false); }
  } );
  CKenabled=true;
}

// button handlers 
function submitEnc() { reload(); }

function submitMoves() {
  var moves = document.getElementById('solnStr').value;
  console.log("Loading move sequence:"+moves);
  reload(0);
  for (var i=0; i<moves.length; i++) {
    var x=null,y=null;
    var c = moves.charAt(i);
    switch (c) {
      case 'W': x=-1; y= 0; break;
      case 'E': x= 1; y= 0; break;
      case 'N': x= 0; y=-1; break;
      case 'S': x= 0; y= 1; break;
    }
    if (x==null) { continue; }
    if (validateMove(x,y)) { applyMove(false,true); }
  }
}

function undoMove() {
  if (solnStr.length == 0) { return; }
  var x,y;
  var c = solnStr[solnStr.length - 1];
  switch (c) {
    case 'W': x= 1; y= 0; break;
    case 'E': x=-1; y= 0; break;
    case 'N': x= 0; y= 1; break;
    case 'S': x= 0; y=-1; break;
  }
  if (validateMove(x,y)) { applyMove(true,false); }
}

function redoMove() {
  if (undoStr.length == 0) { return; }
  var x,y;
  var c = undoStr[undoStr.length - 1];
  switch (c) {
    case 'W': x=-1; y= 0; break;
    case 'E': x= 1; y= 0; break;
    case 'N': x= 0; y=-1; break;
    case 'S': x= 0; y= 1; break;
  }
  if (validateMove(x,y)) { applyMove(false,true); }
}

// mouse-click handler (el is the grid-cell button)
function aClick(el) {
  var ex = parseInt(el.id.charAt(1));
  var ey = parseInt(el.id.charAt(2));
  var px = parseInt(pirateEl.id.charAt(1));
  var py = parseInt(pirateEl.id.charAt(2));
  if (validateMove(ex-px, ey-py)) { applyMove(false,false); }
}

////////////////////////////////////////////////////////////////////////////////////
// Game logic 
////////////////////////////////////////////////////////////////////////////////////

var moveRaft=false;
var newX=null, newY=null;
var stepDir=null;
 
function validateMove(dx,dy)
{
  moveRaft=false;
  newX=null, newY=null;
  stepDir=null;

  // px/py - current position of pirate
  var px = parseInt(pirateEl.id.charAt(1));
  var py = parseInt(pirateEl.id.charAt(2));

  // tCol/tRow - target column and row 
  var tCol = px+dx;
  var tRow = py+dy;

  if (dx > 0 && dy == 0 )       { dx=1;  stepDir='E'; }
  else if (dx < 0 && dy == 0 )  { dx=-1; stepDir='W'; }
  else if (dx == 0 && dy > 0 )  { dy=1;  stepDir='S'; }
  else if (dx == 0 && dy < 0 )  { dy=-1; stepDir='N'; }

  // confirm the pirate is present in the clicked row or column
  // scan forward from the pirate to find somewhere to move to
  // if there is an immediate safe location - step the pirate onto it
  // if there is no candidate safe location - ignore and/or alert
  // otherwise move the pirate+raft to the water next to the safe location

  if ( stepDir == null ) { return false; }       // click does not align with pirate

  // checking for: STEP to safe ground
  if ( checkForSafety(px+dx,py+dy)) { 
    newX=px+dx; newY=py+dy;
    moveRaft=false;
    return true; 
  }

  // if the pirate is not on a raft he cannot move
  if (! pirateEl.classList.contains("raft")) {
    warnAlert ("There is water in that direction - you need a raft");
    return false;
  }

  // pirate is on a raft
  // checking for: PUNT to safe-anchor
  // find closest water cell in contact with safe-ground/raft
  // not blocked by danger 
  var i, result;
  pirateEl.classList.remove("raft"); // temporarily remove raft
  if (dy == 1) { 
    for (i=1; i<gridSz; i++)  {  // south
      result = checkForAnchor(tCol,py+i);
      if ( result != 0 ) { newX=tCol; newY=py+i; break; } 
    } 
  } else if (dy == -1) {    // north
    for (i=1; i<gridSz; i++) { 
      result = checkForAnchor(tCol,py-i);
      if ( result != 0 ) { newX=tCol; newY=py-i; break; } 
    } 
  } else if (dx == 1) {     // east
    for (i=1; i<gridSz; i++)  { 
      result = checkForAnchor(px+i,tRow);
      if ( result != 0 ) { newX=px+i; newY=tRow; break; } 
    } 
  } else if (dx == -1) {    // west
    for (i=1; i<gridSz; i++) {
      result = checkForAnchor(px-i,tRow);
      if ( result != 0 ) { newX=px-i; newY=tRow; break; } 
    }
  }
  pirateEl.classList.add("raft");  // re-add raft

  if (result < 0 ) 
    { warnAlert("There is danger in that direction!"); return false; }
  if (result == 0 )
    { warnAlert("There is no safe anchor in that direction"); return false; }

  // result == 1 (anchor found) - valid move (with raft)
  moveRaft=true;
  return true;
}

function applyMove(undo,redo) {
  // uses presets: moveRaft/newX/newY
  // console.log("applyMove:"+newX+newY+" raft:"+moveRaft)
  var newEl = document.getElementById("M"+newX+newY);
  var oldEl = pirateEl;
  moveKey(oldEl,newEl,"pirate");

  if (moveRaft) { 
    moveKey(oldEl,newEl,"raft");
    if (oldEl.classList.contains("strong")) 
      { moveKey(oldEl,newEl,"strong"); }
    if (newEl.classList.contains("water"))
      { moveKey(newEl,oldEl,"water"); }
  }
  updateEmoji(oldEl);
  updateEmoji(newEl);
  pirateEl=newEl; 

  updateSolnStr(undo, redo);

  if (checkForWin()) { 
    reportWin(); 
    if (autoUp) 
      { setTimeout(function() { levelSelect('+'); }, 100); }
  }
}

function updateSolnStr(undo, redo) {
  // uses presets: stepDir
  if (!undo && !redo) {
    undoStr="";               // clear saved redo
    solnStr=solnStr+stepDir;
  }
  else if (undo) {
    if (solnStr.length == 1) { solnStr=""; }
    else { solnStr=solnStr.substring(0, solnStr.length-1); };
    var backDir;
    if (stepDir == 'N') { backDir='S'; }
    if (stepDir == 'S') { backDir='N'; }
    if (stepDir == 'E') { backDir='W'; }
    if (stepDir == 'W') { backDir='E'; }
    undoStr=undoStr+backDir;
  }
  else {                      // redo
    if (undoStr.length == 1) { undoStr=""; }
    else { undoStr=undoStr.substring(0, undoStr.length-1); }
    solnStr=solnStr+stepDir;
  }
  //console.log("solnStr:"+solnStr+" undoStr:"+undoStr);
  document.getElementById('solnStr').value=solnStr;
  document.getElementById('moveCount').innerHTML=solnStr.length;

  
  document.getElementById("redo").disabled;
  if (solnStr.length == 0)
        { document.getElementById("undo").disabled = true; }
  else  { document.getElementById("undo").disabled = false; }
  if (undoStr.length == 0)
        { document.getElementById("redo").disabled = true; }
  else  { document.getElementById("redo").disabled = false; }
}

function moveKey(el1, el2, key) {
  el1.classList.remove(key);
  el2.classList.add(key);
}

function checkForSafety(x,y) {
  if (x<0 || x>=gridSz || y<0 || y>=gridSz) { return false; }   //  off grid
  //console.log("check for SAFETY at: "+x+y);
  var el = document.getElementById("M"+x+y);
  if ( el.classList.contains("raft")) { return true; }
  if ( el.classList.contains("safe")) { return true; }
  return false;
}
function checkForDanger(x,y) {
  if (x<0 || x>=gridSz || y<0 || y>=gridSz) { return false; }   // off grid
  var el = document.getElementById("M"+x+y);
  //console.log("check for DANGER at: "+x+y+" >"+el.classList);
  if ( el.classList.contains("danger")) { return true; }
  return false;
}

// checkForAnchor return codes
// -1: blocked/danger
//  0: no anchor
//  1: safe anchor
function checkForAnchor(x,y) {
  // check surrounding cells for an object to anchor too
  if (x<0 || x>=gridSz || y<0 || y>=gridSz) { return false; }   // off grid
  //console.log("check for ANCHOR at: "+x+y);
  if (checkForDanger(x,y)) { return -1; }
  found=0;
  if (checkForSafety(x+1,y)) { found=1; }
  else if (checkForSafety(x-1,y)) { found=1; }
  else if (checkForSafety(x,y+1)) { found=1; }
  else if (checkForSafety(x,y-1)) { found=1; }
  return (found);
}

function updateEmoji(el) {
  var clist = el.classList;
  el.innerHTML="";

  if (clist.contains("danger"))   
    { el.innerHTML='&#127744;'; return; }   // blue swirl

  var rX=false, tX=false, pX=false, gX=false, sX=false;
  if (clist.contains("raft"))   { rX=true; }
  if (clist.contains("strong")) { tX=true; }
  if (clist.contains("pirate")) { pX=true; }
  if (clist.contains("goal"))   { gX=true; }
  if (clist.contains("safe"))   { sX=true; }

  // straight:128528 / thinking:129300
  // treasure:128176 / rich:129297 / stars:129321
  // grin:128512 / sunglasses:128526
  if (rX && tX && gX) { 
    // the pirate must be visible until the complete win
    if (!pX || checkForWin())
         { el.innerHTML='&#128176;'; }      // treasure 
    else { el.innerHTML='&#129300;'; }      // pirate
    return; 
  }   
  if (pX && sX)  { el.innerHTML='&#129300;'; return; }  
  if (pX)        { el.innerHTML='&#129300;'; return; }   
  if (!rX && gX) { el.innerHTML='&#10008;';  return; }   // X-mark
  if (sX)        { el.innerHTML='&#127796;'; return; }   // palm-tree
}

function checkForWin() {
  solved=true;
  var set = document.getElementsByClassName("goal");
  Array.prototype.forEach.call(set, function(el) { 
    var x = parseInt(el.id.charAt(1));
    var y = parseInt(el.id.charAt(2));
    var clist = document.getElementById("M"+x+y).classList;
    if (!clist.contains("raft"))   { solved=false; return; }  
    if (!clist.contains("strong")) { solved=false; return; }  
  });
  return (solved);
}
function reportWin() {
  if (!solved) { return false; }
  var msg="SOLVED!";
  setTimeout(function() { alert(msg); }, 100);
  return true;
}