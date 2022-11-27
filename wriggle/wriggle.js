var canvas;
var canvasContext;
var pageX,pageY;
var cWidth,cHeight;

var activeWriggler = null;
var WrigglerA = null;
var WrigglerB = null;
var WrigglerC = null;

var puzzList = []; // 12 max
puzzList[0] = document.currentScript.getAttribute('pz0');
puzzList[1] = document.currentScript.getAttribute('pz1'); 
puzzList[2] = document.currentScript.getAttribute('pz2'); 
puzzList[3] = document.currentScript.getAttribute('pz3');
puzzList[4] = document.currentScript.getAttribute('pz4'); 
puzzList[5] = document.currentScript.getAttribute('pz5'); 
puzzList[6] = document.currentScript.getAttribute('pz6'); 
puzzList[7] = document.currentScript.getAttribute('pz7'); 
puzzList[8] = document.currentScript.getAttribute('pz8'); 
puzzList[9] = document.currentScript.getAttribute('pz9'); 
puzzList[10] = document.currentScript.getAttribute('pz10'); 
puzzList[11] = document.currentScript.getAttribute('pz11'); 

var gridX, gridY;
var cellZ, eX, eY;	// cell size + edge ident (x/y)
var mousePos;
var touchEvent, mouseEvent;

// ==============================================================

function sizeAll() {
	// Prereq: canvas, gridX, gridY 
	// sets pageX, pageY, cellZ, cWidth, cHeight, eX, eY
	// sets canvas and convasContext
	pageX=document.documentElement.clientWidth - 20;
	pageY=document.documentElement.clientHeight - 20;
	
	canvas.width=pageX;
	canvas.height=pageY;
	cWidth=canvas.width;
	cHeight=canvas.height;
	canvasContext = canvas.getContext('2d');
	
	var tmpX = Math.floor((cWidth - 20)/gridX); 
	var tmpY = Math.floor((cHeight - 20)/gridY);
	if (tmpX < tmpY) { cellZ = tmpX; } else { cellZ = tmpY; };
	if ( isOdd(cellZ) ) { cellZ--; } // make cell size even
	
	eX = Math.floor((cWidth - (gridX * cellZ))/2);
	eY = Math.floor((cHeight - (gridY * cellZ))/2);
	//console.log("Sized: cell="+cellZ+" eX/Y="+eX+"/"+eY+" page X/Y="+pageX+"/"+pageY);	
}

var puzzleIndex;
function loadNextPuzzle() 
{
	if (puzzleIndex == undefined) 
	  		{ puzzleIndex = 0; }
	else 	{ puzzleIndex++; }
	
	var Puzz = new PuzzInfo(puzzList[puzzleIndex]);
    var loadError = Puzz.loadPuzz();

	if (loadError != 0) {
	  console.log("loadError: "+loadError); 
      return false;
    }
	
	WrigglerA = new Wriggler(Puzz.wrigA, Puzz.goalA, 'blue', 'lightblue');
	if (Puzz.wrigB) 
	  		{ WrigglerB = new Wriggler(Puzz.wrigB, Puzz.goalB, 'red', 'pink'); }
	else 	{ WrigglerB = null; }
	if (Puzz.wrigC) 
	  		{ WrigglerC = new Wriggler(Puzz.wrigC, Puzz.goalC, 'green', 'lightgreen'); }
	else 	{ WrigglerC = null; }
	
	gridX = Puzz.cols;
	gridY = Puzz.rows;
	sizeAll();
	drawAll();
	return true;
}
   
window.onload = function() {
	
	canvas=document.getElementById('defaultCanvas');
    loadNextPuzzle();
	
	window.addEventListener("resize", 
		function(evt) {
			sizeAll();
			drawAll();		
		}, false);
	
	canvas.addEventListener("touchstart", 
		function(evt) {
			if (evt.target == canvas) {evt.preventDefault(); }
  			touchEvent = evt.touches[0];
  			mouseEvent = new MouseEvent("mousedown", {
   			  clientX: touchEvent.clientX,
   			  clientY: touchEvent.clientY
 		 	});
 	 		canvas.dispatchEvent(mouseEvent);
		}, false);
	
	canvas.addEventListener("touchend", 
		function(evt) {
			if (evt.target == canvas) {evt.preventDefault(); }
  			mouseEvent = new MouseEvent("mouseup", {});
 			canvas.dispatchEvent(mouseEvent);
		}, false);
	
	canvas.addEventListener("touchmove", 
		function(evt) {
			if (evt.target == canvas) {evt.preventDefault(); }
  			touchEvent = evt.touches[0];
  			mouseEvent = new MouseEvent("mousemove", {
  			  clientX: touchEvent.clientX,
  			  clientY: touchEvent.clientY
 			 });
  			canvas.dispatchEvent(mouseEvent);
		}, false);

	canvas.addEventListener('mousedown',
		function(evt) {
			mousePos = calculateMousePos(evt);
			if (WrigglerA.detectClick(mousePos.x, mousePos.y)) 
				{ activeWriggler = WrigglerA; }
			if (WrigglerB && WrigglerB.detectClick(mousePos.x, mousePos.y)) 
				{ activeWriggler = WrigglerB; }
			if (WrigglerC && WrigglerC.detectClick(mousePos.x, mousePos.y)) 
				{ activeWriggler = WrigglerC; }	
			//console.log("mouse DOWN at: [" + mousePos.x + "," + mousePos.y + "]");
		});
		
	canvas.addEventListener('mousemove',
		function(evt) {
			if ( activeWriggler == null ) { return; }
			
			var dir=undefined;
			mousePos = calculateMousePos(evt);
			//console.log("mouse MOVE at: [" + mousePos.x + "," + mousePos.y + "]");
			
			var pCo = getPixelCo(mousePos);
			if (activeWriggler && pCo == 'rgb(245,245,245)') // whitesmoke
			  { dir = activeWriggler.validateDrag(mousePos.x, mousePos.y) }	
			if (dir == undefined) { return; }
			
			activeWriggler.moveWrig(dir);
			drawAll();
			
			var solved = true;
			if (WrigglerA && !WrigglerA.checkForWin()) { solved = false; }
			if (WrigglerB && !WrigglerB.checkForWin()) { solved = false; }
			if (WrigglerC && !WrigglerC.checkForWin()) { solved = false; }
			
			//if (solved) { alertSolved(); }
			if (solved) { 
				setTimeout( function() { 
					if (confirm(" SUCCESS! ... try next puzzle?")) { loadNextPuzzle(); }
				}, 500 );
			}
		});
		
	canvas.addEventListener('mouseup',
		function(evt) {
			mousePos = calculateMousePos(evt);
			if (activeWriggler != null) activeWriggler.drop();
			activeWriggler = null; 
			//console.log("mouse UP at: [" + mousePos.x + "," + mousePos.y + "]");
			
		});
}

function drawAll() {
	// draw background
	colorRect(0,0, canvas.width,canvas.height, 'white');
	
	drawGrid();
	WrigglerA.drawGoal();
	if (WrigglerB) { WrigglerB.drawGoal(); }
	if (WrigglerC) { WrigglerC.drawGoal(); }
	WrigglerA.drawWrig();
	if (WrigglerB) { WrigglerB.drawWrig(); }
	if (WrigglerC) { WrigglerC.drawWrig(); }
}

function drawGrid() {
	for(var i=0; i<gridX; i++) { 
		for(var j=0; j<gridY; j++) { 
		  var x = eX + ( i * cellZ );
		  var y = eY + ( j * cellZ );
		  colorRect(x+1 ,y+1, cellZ-2, cellZ-2, 'lightgray');
		  colorCircle(x+cellZ/2, y+cellZ/2, cellZ/3, 'whitesmoke', false);	
		}
	}
} 


// Wriggler =========================================================

class Wriggler 
{
  constructor(wrigArray, goalArray, wCo, gCo) {
    this.wCo = wCo;
    this.gCo = gCo;
    this.wrigList = wrigArray;
    this.goalList = goalArray; 
    this.wrigChain = [];
    this.goalChain = [];
    this.wrigLen = wrigArray.length;
	this.activeCell = undefined;
  }

  checkForWin() {
	for (var gCell of this.goalList) {
		var match = false;
		for (var wCell of this.wrigList) {
			if ( gCell.x == wCell.x && gCell.y == wCell.y ) 
				{ match = true; break; };
		}
		if (match == false) { return false; }
    }
    //console.log("MATCH!") ;
    return true;
  }

  drawGoal() { 
	this.goalChain = [];
	this.goalList.forEach(cell => {
		var x = eX + ( cell.x * cellZ );
		var y = eY + ( cell.y * cellZ );
		this.goalChain.push([x,y]);
		colorRect(x+1, y+1, cellZ-2,cellZ-2 , this.gCo)
		colorCircle(x+cellZ/2, y+cellZ/2, cellZ/3, 'whitesmoke', false);	
		return true;
    } )
  }

  drawWrig() { 
	var prevX=null, prevY=null;
	this.wrigChain = [];
	 
	this.wrigList.forEach(cell => {
		var px = eX + ( cell.x * cellZ ) + cellZ/2;
		var py = eY + ( cell.y * cellZ ) + cellZ/2;
		colorCircle(px,py, cellZ/2-4, this.wCo, false);
		this.wrigChain.push({x:px, y:py});
		
		if (prevX != null) {
		  var px2=px, py2=py;
		  if (prevX < px) { px2 -= cellZ/2; }
		  if (prevY < py) { py2 -= cellZ/2; }
		  if (prevX > px) { px2 += cellZ/2; }
		  if (prevY > py) { py2 += cellZ/2; }
		  colorCircle(px2,py2, cellZ/2-4, this.wCo, false);	
		}
		prevX = px; prevY = py;
		return true;
    } )
  }

  validateDrag(pX, pY) {
	// we already know the cell is empty
	if (this.activeCell == null) { return; }
	var zCell = this.wrigChain[this.activeCell];
	var diffX = zCell.x - pX;
	var diffY = zCell.y - pY;
	var dA = cellZ/3;
	var dir=undefined;
	
	if (diffX < dA && diffX > -dA) {
	  if (diffY > cellZ-dA && diffY < cellZ+dA) { dir='N'; }
	  if (diffY > -cellZ-dA && diffY < -cellZ+dA) { dir='S'; }	
    }
	if (diffY < dA && diffY > -dA) {	
	  if (diffX > cellZ-dA && diffX < cellZ+dA) { dir='W'; }
	  if (diffX > -cellZ-dA && diffX < -cellZ+dA) { dir='E'; }	
	}
    return dir;
  }

  drop() { this.activeCell = null; }		// mouse UP

  detectClick(pX, pY) { 
	if ( hitCell(pX,pY, this.wrigChain[0], cellZ/2 - 6) ) { 
		this.activeCell = 0; 				// index of head cell
		return true; 
	}
	if ( hitCell(pX,pY, this.wrigChain[this.wrigLen-1], cellZ/2 - 6)) { 
		this.activeCell = this.wrigLen-1; 	// index of tail cell
		return true; 
	}
	this.activeCell = null;
	return false;
  }

  moveWrig(dir) {
	// console.log("Move:"+dir+" ActiveCell:"+ this.activeCell);
	if (this.activeCell == null)  { return; }
	if (this.activeCell == 0) 
	     { this.moveHead(dir); }
	else { this.moveTail(dir); }
  }

  logMe() {
	var str = "";
    this.wrigList.forEach(cell => { str += "["+cell.x+":"+cell.y+"]"; })
    //console.log("WRIG: "+str);
  }
  
  moveHead(dir) { 
	var newCell = { x: this.wrigList[0].x, y: this.wrigList[0].y };
	if ( dir == 'E' ) { newCell.x += 1 };
	if ( dir == 'S' ) { newCell.y += 1 };
	if ( dir == 'W' ) { newCell.x -= 1 };
	if ( dir == 'N' ) { newCell.y -= 1 };
	this.wrigList.unshift(newCell);		// Insert new cell at START of list
	this.wrigList.pop();				// remove LAST cell
  }
  moveTail(dir) { 
    var last = this.wrigLen-1;
	var newCell = { x: this.wrigList[last].x, y: this.wrigList[last].y };
	if ( dir == 'E' ) { newCell.x += 1 };
	if ( dir == 'S' ) { newCell.y += 1 };
	if ( dir == 'W' ) { newCell.x -= 1 };
	if ( dir == 'N' ) { newCell.y -= 1 };
	
	this.wrigList.push(newCell);		// Insert new cell at END of List
	this.wrigList.shift();				// remove FIRST cell
  }
}

// ==============================================================

class PuzzInfo
{
  constructor(str) {
    this.encStr = str;
	this.rows;
	this.cols;
	this.wrigA = []; this.goalA = [];
	this.wrigB = []; this.goalB = [];
	this.wrigC = []; this.goalC = [];
	console.log("new PuzzInfo: "+str)
  }

  printInfo(str) {
	console.log("Puzz: "+str+" "+this.rows+"/"+this.cols);
  }

  loadPuzz() {
	if (this.encStr == null) { return 1; }

	this.cols = this.encStr[0];
	this.rows = this.encStr[1];
	if (this.rows>9 || this.cols>9) { return 3; }
	if (this.rows<2 || this.cols<2) { return 4; }

	var len=this.encStr.length;
	var chunk=0;
	var array;
	var c1,c2,cX=0,cY=0;
	var index=2;
	while (index < len ) 
	{
	  	c1 = this.encStr[index];		
		if (c1 < '0' || c1 > '9') {		// expect 1 char (NEWS)
			if (c1 == 'W') cX--;
			else if (c1 == 'E') cX++;
			else if (c1 == 'S') cY++;
			else if (c1 == 'N') cY--;
			else if (c1 == ':') {
				// rest of string is title
				this.printInfo(this.encStr.slice(index+1,len));
				index = len;
				continue;
			}
			else { return 5; }	// bad char
			
			//console.log("+++ ["+cX+":"+cY+"]")
			var cell = { x:cX, y:cY };
			array.push(cell);
			index++;
		}
		else {						// expect 2 chars (0-9)
			chunk++;		
			if      (chunk == 1) { array = this.wrigA; }
			else if (chunk == 2) { array = this.goalA; }
			else if (chunk == 3) { array = this.wrigB; }
			else if (chunk == 4) { array = this.goalB; }
			else if (chunk == 5) { array = this.wrigC; }
			else if (chunk == 6) { array = this.goalC; }	
			else { return 6; }	// too many chunks
	
			c2 = this.encStr[index+1];
			if (c2 < '0' || c2 > '9') { return 7; }	
			
			cX = parseInt(c1); cY = parseInt(c2);
			//console.log(">>> ["+cX+":"+cY+"]")
			var cell = { x:cX, y:cY };
			array.push(cell);
			index +=2 ;	
		}
	}
	// make sure wrigB/C are undef - if not specified
	if (chunk < 5) { this.wrigC = null; this.goalC = null; }
	if (chunk < 3) { this.wrigB = null; this.goalB = null; }
	return 0;		// success
  }
}

// ==============================================================

  
function alertSolved() {
  alert("!! SOLVED !!");
}

function isOdd(num) { return num % 2;}

function rgbToHex(rgb) { 
  var hex = Number(rgb).toString(16);
  if (hex.length < 2) { hex = "0" + hex; }
  return hex;
};

function fullColorHex(r,g,b) {   
  var red = rgbToHex(r);
  var green = rgbToHex(g);
  var blue = rgbToHex(b);
  return red+green+blue;
};

function getPixelCo(mousePos) {
  var pixel = canvasContext.getImageData(mousePos.x, mousePos.y, 1, 1).data;
  var co = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
  //console.log("getPixelCo: "+co); 
  return co;
}

function hitCell(px,py, cell, range) {
  return Math.sqrt((px - cell.x) ** 2 + (py - cell.y) ** 2) < range;
}

function colorCircle(x,y, radius, Co, debug) {
	if (debug) { console.log("DrawCircle at "+x+":"+y+" C="+Co); }
	canvasContext.fillStyle = Co;
	canvasContext.beginPath();
	canvasContext.arc(x, y, radius, 0,Math.PI*2,true);
	canvasContext.fill();
}

function colorRect(x,y, w,h, Co) {
	canvasContext.fillStyle = Co;
	canvasContext.fillRect(x,y, w,h);
}

function calculateMousePos(evt) {
	var rect = canvas.getBoundingClientRect();
	var root = document.documentElement;
	var mouseX = evt.clientX - rect.left - root.scrollLeft;
	var mouseY = evt.clientY - rect.top - root.scrollTop;
	return {
		x:mouseX,
		y:mouseY
	};
}

