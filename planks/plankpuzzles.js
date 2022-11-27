
var PlankPuzzles = {};

PlankPuzzles.color = {};
PlankPuzzles.color.Background = "#00a3cc";
PlankPuzzles.color.Nearground = "#66e0ff";
PlankPuzzles.color.Stump = "#996600";
PlankPuzzles.color.GoalStump = "#FF0000";
PlankPuzzles.color.Plank = "#ffcc33";

PlankPuzzles.appInitialize = function()
{
	var puzApps = document.getElementsByTagName('x-plank-puzzle-window');

	for(var i = 0; i < puzApps.length; i++)
	{
		if(!puzApps[i]._init)
		{
			puzApps[i].style.height = puzApps[i].getAttribute('height') + "px";
			puzApps[i].style.width = puzApps[i].getAttribute('width') + "px";

			if(Number(puzApps[i].getAttribute('width')) < 300)
			{
				
				puzApps[i].className += "small_txt";
			}

			puzApps[i].style.backgroundColor = PlankPuzzles.color.Background;

			var topRow = document.createElement('div');
			topRow.className = "top"
			puzApps[i].appendChild(topRow);

			

			var bottomRow = document.createElement('div');
			bottomRow.className = "bottom"
			puzApps[i].appendChild(bottomRow);

			//PREVIOUS
				var g1 = document.createElement('button');
				g1.innerHTML = "Prev Puzzle";
				g1.onclick = function()
				{
					var pApp = this.parentNode.parentNode;
					pApp.levelNum--;
					if(pApp.levelNum < 0)
						pApp.levelNum = 0;

					PlankPuzzles.PlayBoard(pApp);
				}

				topRow.appendChild(g1);
			
			var g3 = document.createElement('div');
			g3.className ='title';
			g3.innerHTML = "Puzzle Name";
			topRow.appendChild(g3);

			//NEXT
				var g2 = document.createElement('button');
				g2.innerHTML = "Next Puzzle";
				g2.onclick = function()
				{
					var pApp = this.parentNode.parentNode;
					pApp.levelNum++;
					if(pApp.levelNum >= pApp.getElementsByTagName('x-plank-puzzle').length)
						pApp.levelNum = pApp.getElementsByTagName('x-plank-puzzle').length-1;

					PlankPuzzles.PlayBoard(pApp);
				}
				topRow.appendChild(g2);

			if(puzApps[i].getElementsByTagName('x-plank-puzzle').length < 2)
			{
				g1.style.display = "none";
				g2.style.display = "none";
				g3.style.width="100%";
			}

			//LOAD
				var g2 = document.createElement('button');
				g2.innerHTML = "Load";
				g2.className = "Load";
				g2.onclick = function()
				{
					pApp = this.parentNode.parentNode;

					var pasteDiv = document.createElement('div');
					pasteDiv.className = 'copybox';

					var innerDiv = document.createElement('div');
					innerDiv.className = "body";

					var textDiv = document.createElement('div');
					textDiv.className = 'msg';
					textDiv.innerHTML = "To restore a previously saved game, copy its code into the box below";
					innerDiv.appendChild(textDiv);

					var textArea = document.createElement('textarea');
					textArea.cols = "1000";
					innerDiv.appendChild(textArea);

					var buttonDiv = document.createElement('div');
					buttonDiv.className='buttons';
					var button1 = document.createElement('button');
					button1.innerHTML = "Restore Game";
					button1.onclick = function()
					{
						var txt = this.parentNode.parentNode.getElementsByTagName('textarea')[0].value;

						var m =PlankPuzzles.ParseLoadstring(txt);
						
						this.parentNode.parentNode.getElementsByClassName('msg')[0].innerHTML = m.msg;	
						
						if(m.msg == "Success")
						{
							var pApp = this.parentNode.parentNode.parentNode.parentNode;
							var puzzles = pApp.getElementsByTagName('x-plank-puzzle');
							var i = 0;

							while(i < puzzles.length && puzzles[i].getAttribute('nodes') != m.nodes 
								&& puzzles[i].getAttribute('positions') != m.positions)
								i++;
								
							if(i == puzzles.length)
							{
								var newPuzzle = document.createElement('x-plank-puzzle');
								newPuzzle.setAttribute("nodes",m.nodes);
								newPuzzle.setAttribute("positions",m.positions);
								newPuzzle.setAttribute("fmt",m.fmt);
								newPuzzle.setAttribute("name","unknown");

								pApp.appendChild(newPuzzle)
								
							}

							pApp.levelNum = i;
							PlankPuzzles.PlayBoard(pApp);

							pApp.history.moves = m.history;

							pApp.history.ptr = pApp.history.moves.length;
							pApp.state.on = pApp.history.moves[pApp.history.ptr-1].plank;
							pApp.state.holding = false;

							var lastCompleted = pApp.history.ptr-1;

							if(pApp.history.moves[pApp.history.ptr-1].pos == undefined)
							{
								lastCompleted--;
								pApp.history.ptr -= .5;
								pApp.state.holding = true;
							}

							for(var j=0; j< pApp.state.planks.length; j++)
							{			
								var i = lastCompleted;
								while(i >=0 && pApp.history.moves[i].plank != j)
									i--;
	
								if(i >= 0)
								{
									pApp.state.planks[j][0] = pApp.history.moves[i].pos[0].slice();
									pApp.state.planks[j][1] = pApp.history.moves[i].pos[1].slice();
								}
								else
								{
									pApp.state.planks[j][0] = pApp.lvldata.planks[j][0].slice();
									pApp.state.planks[j][1] = pApp.lvldata.planks[j][1].slice();
								}
							}

							PlankPuzzles.DrawUpdate(pApp);

							var box = pApp.getElementsByClassName('copybox')[0];
							box.parentNode.removeChild(box);
						}
					}
					buttonDiv.appendChild(button1);

					var button2 = document.createElement('button');
					button2.innerHTML = "Cancel";
					button2.onclick = function()
					{
						var box = this.parentNode.parentNode.parentNode

						box.parentNode.removeChild(box);
					}
					buttonDiv.appendChild(button2);
					innerDiv.appendChild(buttonDiv);

					pasteDiv.appendChild(innerDiv);
					pApp.appendChild(pasteDiv);
					
				}
				bottomRow.appendChild(g2);
				g2 = document.createElement('button');

			//SAVE
				var g2 = document.createElement('button');
				g2.innerHTML = "Save";
				g2.className = "Save";
				g2.onclick = function()
				{
					pApp = this.parentNode.parentNode;

					var pasteDiv = document.createElement('div');
					pasteDiv.className = 'copybox';

					var innerDiv = document.createElement('div');
					innerDiv.className = "body";

					var textDiv = document.createElement('div');
					textDiv.className = 'msg';
					textDiv.innerHTML = "Copy this code exactly to save the state of the puzzle<br>Restore it by using load";
					innerDiv.appendChild(textDiv);

					var textArea = document.createElement('textarea');
					textArea.readOnly = "readonly";
					
					textArea.innerHTML += "Planks format 1\nPositions = \"";
					textArea.innerHTML += pApp.getElementsByTagName('x-plank-puzzle')[pApp.levelNum].getAttribute('positions');
					textArea.innerHTML += "\"\nNodes = \""
					textArea.innerHTML += pApp.getElementsByTagName('x-plank-puzzle')[pApp.levelNum].getAttribute('nodes');
					textArea.innerHTML += "\"\n"

					var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

					for(var i=0; i < pApp.history.moves.length; i++)
					{
						var move = pApp.history.moves[i];
						textArea.innerHTML += "P" + (move.plank+1) + " -> ";
						if(move.pos != undefined)
						{
							var a0 = chars.substring(move.pos[0][0],move.pos[0][0]+1);
							var a1 = chars.substring(move.pos[0][1],move.pos[0][1]+1);
							var a2 = chars.substring(move.pos[1][0],move.pos[1][0]+1);
							var a3 = chars.substring(move.pos[1][1],move.pos[1][1]+1);
							textArea.innerHTML += "("+a0+","+a1+")-("+a2+","+a3+")\n";
						}
							
					}

					innerDiv.appendChild(textArea);

					var button2 = document.createElement('button');
					button2.innerHTML = "Close";
					button2.onclick = function()
					{
						var box = this.parentNode.parentNode;

						box.parentNode.removeChild(box);
					}
					innerDiv.appendChild(button2);

					pasteDiv.appendChild(innerDiv);
					pApp.appendChild(pasteDiv);
					
				}
				bottomRow.appendChild(g2);
				g2.style.display = "none";
				g2 = document.createElement('button');
			//RESTART
				g2.innerHTML = "Restart";
				g2.onclick = function()
				{
					var pApp = this.parentNode.parentNode;
					PlankPuzzles.PlayBoard(pApp);
				};
				bottomRow.appendChild(g2);

			//UNDO
				g2 = document.createElement('button');
				g2.innerHTML = "Undo";
				g2.onclick = function()
				{
					var pApp = this.parentNode.parentNode;

					if(pApp.history.ptr > 0)
					{
						pApp.history.ptr -= .5;
						pApp.state.on = pApp.history.moves[Math.floor(pApp.history.ptr)].plank;

						var i = Math.floor(pApp.history.ptr)-1;
						while(i >=0 && pApp.history.moves[i].plank != pApp.state.on)
							i--;
							
						if(i >= 0)
						{
							pApp.state.planks[pApp.state.on][0] = pApp.history.moves[i].pos[0].slice();
							pApp.state.planks[pApp.state.on][1] = pApp.history.moves[i].pos[1].slice();
						}
						else
						{
							pApp.state.planks[pApp.state.on][0] = pApp.lvldata.planks[pApp.state.on][0].slice();
							pApp.state.planks[pApp.state.on][1] = pApp.lvldata.planks[pApp.state.on][1].slice();
						}

						pApp.state.holding = (pApp.history.ptr % 1 != 0);
						PlankPuzzles.DrawUpdate(pApp);
					}

				}
				bottomRow.appendChild(g2);

			//REDO
				g2 = document.createElement('button');
				g2.innerHTML = "Redo";
				g2.onclick = function()
				{
					var pApp = this.parentNode.parentNode;

					if(pApp.history.moves.length != 0 && pApp.history.ptr < pApp.history.moves.length
						-(pApp.history.moves[pApp.history.moves.length-1].pos == undefined?.5:0))
					{
						pApp.history.ptr += .5;
						
						if(pApp.history.ptr % 1 != 0)
						{
							pApp.state.on = pApp.history.moves[Math.floor(pApp.history.ptr)].plank;
							pApp.state.holding = true;
						}
						else
						{
							pApp.state.holding = false;
							var span = pApp.history.moves[pApp.history.ptr-1].pos
							pApp.state.planks[pApp.state.on][0] = span[0].slice();
							pApp.state.planks[pApp.state.on][1] = span[1].slice();

							if((span[0][0]== pApp.lvldata.end[0] && span[0][1]== pApp.lvldata.end[1])
								|| (span[1][0]== pApp.lvldata.end[0] && span[1][1]== pApp.lvldata.end[1]))
							{
								PlankPuzzles.successDialog(pApp);
							}
						}
						PlankPuzzles.DrawUpdate(pApp);
						
					}

				}
				bottomRow.appendChild(g2);
			
			//REPLAY
				g2 = document.createElement('button');
				g2.innerHTML = "Replay";
				g2.onclick = function()
				{
					pApp = this.parentNode.parentNode;
					pApp.history.ptr = 0;
					for(var i=0; i<pApp.state.planks.length; i++)
					{
						var plank = pApp.state.planks[i];
						var start = pApp.lvldata.start;

						plank[0][0] = pApp.lvldata.planks[i][0][0];
						plank[0][1] = pApp.lvldata.planks[i][0][1];
						plank[1][0] = pApp.lvldata.planks[i][1][0];
						plank[1][1] = pApp.lvldata.planks[i][1][1];

						if((plank[0][0] == start[0] && plank[0][1] == start[1]) 
						|| (plank[1][0] == start[0] && plank[1][1] == start[1]))
							pApp.state.on = i;
					}
					pApp.state.holding = false;

					PlankPuzzles.DrawUpdate(pApp);
				}
				bottomRow.appendChild(g2);

			//ABOUT
				g2 = document.createElement('button');
				g2.innerHTML = "About";
				g2.onclick = function()
				{
					pApp = this.parentNode.parentNode;

					var pasteDiv = document.createElement('div');
					pasteDiv.className = 'copybox';

					var innerDiv = document.createElement('div');
					innerDiv.className = "body";

					var textDiv = document.createElement('div');
					textDiv.className = 'msg';
					textDiv.innerHTML = 
						"<h2>Credits and Copyrights</h2> \
						<p>Planks version 3.0</p>\
						<p>Concept Andrea N. Gilbert, 2000</p>\
						<p>Unless otherwise stated, puzzles © Andrea N. Gilbert, 2000-2002</p>\
						<p>Original Applet © Graham E. Rogers 2000-2003</p>\
						<p>HTML5 implementation Jeremy D. Miller 2017</p>\
						<p></p>\
						<p></p>\
						<p></p>";
					innerDiv.appendChild(textDiv);

					

					var buttonDiv = document.createElement('div');
					buttonDiv.className='buttons';
					
					var button2 = document.createElement('button');
					button2.innerHTML = "Return";
					button2.onclick = function()
					{
						var box = this.parentNode.parentNode.parentNode
						box.parentNode.removeChild(box);
					}
					buttonDiv.appendChild(button2);
					innerDiv.appendChild(buttonDiv);

					pasteDiv.appendChild(innerDiv);

					
					
					pApp.appendChild(pasteDiv);

					console.log(innerDiv.scrollHeight);
					console.log(pApp.clientHeight);
					if(innerDiv.scrollHeight > pApp.clientHeight)
					{
						innerDiv.style.top = "0px";
						innerDiv.style.left = "0px";
						innerDiv.style.right = "0px";
						innerDiv.style.bottom = "0px";
						innerDiv.style.overflowY = "scroll";
						innerDiv.style.overflowX = "hidden";
						
					}
					else if (innerDiv.scrollHeight > pApp.clientHeight*.5)
					{
					
						var extraSpace = pApp.clientHeight-innerDiv.scrollHeight;								
						innerDiv.style.top = extraSpace/2+"px";
					}

				}	
				bottomRow.appendChild(g2);

			var counterBox = document.createElement('div');
			counterBox.className = 'counter';
			counterBox.style.position = 'absolute';
			puzApps[i].appendChild(counterBox);
			
			var backCanvas = document.createElement('canvas');
			backCanvas.className='backCanvas';
			backCanvas.width = puzApps[i].getAttribute('width');
			backCanvas.height = puzApps[i].getAttribute('height');
			puzApps[i].appendChild(backCanvas);

			var frontCanvas = document.createElement('canvas');
			frontCanvas.className='frontCanvas';
			frontCanvas.width = puzApps[i].getAttribute('width');
			frontCanvas.height = puzApps[i].getAttribute('height');
			puzApps[i].appendChild(frontCanvas);

			puzApps[i].levelNum = 0;
			PlankPuzzles.PlayBoard(puzApps[i]);

			puzApps[i]._init = true;


		}
	}
}

PlankPuzzles.ParseLoadstring = function(txt)
{
	var lines = txt.split(/\r\n|\r|\n/);
	if(lines[0].trim() != "Planks format 1")
		return {'msg':"Doesn't begin with Planks format 1"};
	lines.shift();

	var positions = lines.shift();

	if(positions == undefined)
		return {'msg':"Position string must be on line 2"};
	positions = positions.split("=");
	if(positions.length != 2 || positions[0].trim() != "Positions")
		return {'msg':"Invalid position format"};
	positions = positions[1].trim();
	if(positions.substring(0,1) != '"' || positions.substring(positions.length-1,positions.length) !='"')
		return {'msg':"Invalid position format"};
	positions = positions.substring(1,positions.length-1);

	if(positions.length % 4 == 3 && positions.substring(positions.length-1,positions.length) == "6")
		return {'msg':"Hex Swamps not supported"};
	
	if(positions.length%4 != 2 || positions.length < 6)
		return {'msg':"Positions are not valid"};

	var nodes = lines.shift();

	if(nodes == undefined)
		return {'msg':"Node string must be on line 3"};
	nodes = nodes.split("=");
	if(nodes.length != 2 || nodes[0].trim() != "Nodes")
		return {'msg':"Invalid node format"};
	nodes = nodes[1].trim();
	if(nodes.substring(0,1) != '"' || nodes.substring(nodes.length-1,nodes.length) !='"')
		return {'msg':"Invalid node format"};
	nodes = nodes.substring(1,nodes.length-1);

	var count = 0;
	
	function toNum(char)
	{
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
		return chars.indexOf(char);
	}
	var expectedRows = toNum(positions.substring(1,2));
	while(count < nodes.length)
	{
		count += toNum(nodes.substring(count,count+1)) + 1;
		expectedRows--;
	}

	if(count != nodes.length || expectedRows != 0)
		return {'msg':"Nodes are not valid"};
	

	//parse History
	var history = [];

	while(lines.length > 0)
	{
		var move = lines.shift();

		move = move.split("->");

		move[0] = move[0].trim();
		if(move[0].substring(0,1) != "P")
			break;

		move[0] = move[0].substring(1);

		if(move[0].length == 0)
			break;
		
		if(isNaN(Number(move[0])))
			break;

		move[0] = Number(move[0])-1;
		history.push({"plank":move[0]});

		if(move[1] == undefined || move[1].trim() == "")
			break;

		move[1] = move[1].replace(/\(|\)| |-|,|/g, "");

		if(move[1].length != 4)
			break;

		var pos = [];
		pos[0]= toNum(move[1].substring(0,1));
		pos[1]= toNum(move[1].substring(1,2));
		pos[2]= toNum(move[1].substring(2,3));
		pos[3]= toNum(move[1].substring(3,4));

		if(pos[0] == -1 || pos[1] == -1 ||pos[2] == -1 || pos[3] == -1)
			break;

		if(pos[0] < pos[2] || (pos[0] == pos[2] && pos[1] < pos[3]))
		{
			history[history.length-1].pos = [[pos[0],pos[1]],[pos[2],pos[3]]];
		}
		else
		{
			history[history.length-1].pos = [[pos[2],pos[3]],[pos[0],pos[1]]];
		}
			
	}

	return {'msg':"Success", 'fmt':1, 'nodes':nodes, 'positions':positions,'history':history};
}

PlankPuzzles.PlankFormat = function(level)
{
	this.width = 0;
	this.height = 0;
	this.planks = []; //plank represented as an array [[x,y],[x,y]]
	this.stumps = [];
	this.start = [];
	this.end = [];

	function toNum(char)
	{
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
		var index = chars.indexOf(char);
		if(index == -1)
			throw new Error("Invalid character")
		return index;
	}

	if(level == "" || level == undefined )
		throw new Error("invalid x-plank-puzzle element");

	if(!level.hasAttribute('name') 
		|| !level.hasAttribute('nodes') 
		|| !level.hasAttribute('positions'))
		throw new Error("x-plank-puzzle element missing attributes");
	

	var nodes = level.getAttribute('nodes');
	var positions = level.getAttribute('positions');

	this.width = toNum(positions.substring(0,1));
	this.height = toNum(positions.substring(1,2));
	
	this.start[0] = toNum(positions.substring(2,3));;
	this.start[1] = toNum(positions.substring(3,4));;
	this.end[0] = toNum(positions.substring(4,5));;
	this.end[1] = toNum(positions.substring(5,6));;

	positions = positions.substring(6);

	while(positions.length > 0)
	{
		this.planks.push(positions.substring(0,4));
		positions = positions.substring(4);
	}

	for(var i=0; i< this.planks.length; i++)
	{
		var dsc = this.planks[i];
		this.planks[i] = [[0,0],[0,0]];
		this.planks[i][0][0] = toNum(dsc.substring(0,1));
		this.planks[i][0][1] = toNum(dsc.substring(1,2));
		this.planks[i][1][0] = toNum(dsc.substring(2,3));
		this.planks[i][1][1] = toNum(dsc.substring(3,4));
	}

	var rows = [];

	while(nodes.length > 0)
	{
		var endpoint = toNum(nodes.substring(0,1))+1;
		rows.push(nodes.substring(0,endpoint));
		nodes = nodes.substring(endpoint);
	}
	
	for(var i=0; i < rows.length; i++)
	{
		rows[i] = rows[i].substring(1);

		for(var j=0; j < rows[i].length; j++)
		{
			this.stumps.push([toNum(rows[i].substring(j,j+1)),i]);
		}
	}
}


/**
 * type puzWindow = HTMLElement extended with
 *   lvldata: PlankFormat
 *   drwdata: [
 *     int (x offset of inner rectangle)
 *     int (y offset of inner rectangle)
 *     int (pixel distance between stumps)
 *   ]
 *   state: {
 *	   planks: []
 *     on: 
 *     holding: 
 *   }
 *   history: {
 *	   moves: []
 *     ptr: int
 *   }
 */
PlankPuzzles.PlayBoard = function(puzWindow)
{
	puzWindow.getElementsByClassName('Load')[0].style.display = "inline-block";
	puzWindow.getElementsByClassName('Save')[0].style.display = "none";

	var puzzle = puzWindow.getElementsByTagName('x-plank-puzzle')[puzWindow.levelNum];

	try{

		puzWindow.getElementsByClassName('title')[0].innerHTML = puzzle.getAttribute('name') 
		+ " [" + (puzWindow.levelNum+1) + "]";
	}
	catch(e)
	{
		puzWindow.getElementsByClassName('title')[0].innerHTML = "<span style='color: red'>error</span>";
	}
	
	try
	{
		puzWindow.lvldata = new PlankPuzzles.PlankFormat(puzzle);

		puzWindow.drwdata = [0,0,1];

		var xlen = puzWindow.lvldata.width + 1;
		var ylen = puzWindow.lvldata.height + 1;
		var maxHeight = puzWindow.getAttribute('height') - puzWindow.getElementsByClassName('top')[0].offsetHeight*2;
		var maxWidth = puzWindow.getAttribute('width');

		puzWindow.drwdata[2] = maxWidth/xlen;

		if(maxHeight/ylen < puzWindow.drwdata[2])
			puzWindow.drwdata[2] = maxHeight/ylen;

		xlen = puzWindow.lvldata.width - 1;
		ylen = puzWindow.lvldata.height - 1;
		maxHeight = puzWindow.getAttribute('height');
		maxWidth = puzWindow.getAttribute('width');

		puzWindow.drwdata[0] = (maxWidth - xlen*puzWindow.drwdata[2])/2;
		puzWindow.drwdata[1] = (maxHeight - ylen*puzWindow.drwdata[2])/2;

		PlankPuzzles.InitialDraw(puzWindow);

		function cpyArr(arr)
		{
			var g = [];
			for (var i = 0; i < arr.length; i++)
			{
				g[i] = arr[i].slice();
			}

			return g;
		}

		puzWindow.state = {};
		puzWindow.state.planks = cpyArr(puzWindow.lvldata.planks);
		puzWindow.state.on = -1;
		puzWindow.state.holding = false;

		puzWindow.history = {};
		puzWindow.history.moves = [];
		puzWindow.history.ptr = 0;

		for(var i=0; i < puzWindow.state.planks.length; i++)
		{
			var plank = puzWindow.state.planks[i];
			var start = puzWindow.lvldata.start;
			if((plank[0][0] == start[0] && plank[0][1] == start[1]) 
			|| (plank[1][0] == start[0] && plank[1][1] == start[1]))
				puzWindow.state.on = i;
		}

		PlankPuzzles.DrawUpdate(puzWindow);


		var frontCanvas = puzWindow.getElementsByClassName('frontCanvas')[0];

		frontCanvas.onclick = function(e)
		{
			var puzWindow = this.parentNode; 
			var x = (e.offsetX - puzWindow.drwdata[0])/puzWindow.drwdata[2];
			var y = (e.offsetY - puzWindow.drwdata[1])/puzWindow.drwdata[2];
			

			//Calculate closest grid points to mouse click
			var points = [];
			points.push([Math.floor(x),Math.floor(y),1]);
			points.push([Math.floor(x+1),Math.floor(y),1]);
			points.push([Math.floor(x),Math.floor(y+1),1]);
			points.push([Math.floor(x+1),Math.floor(y+1),1]);

			for(var i = 0; i < points.length; i++)
			{
				points[i][2] = Math.sqrt((points[i][0]-x)*(points[i][0]-x) + (points[i][1]-y)*(points[i][1]-y));
			}

			points.sort(function(a,b)
			{
				if(a[2] <= b[2])
					return -1;
				else
					return 1;
			});

			function isStump(puzWindow,coord)
			{
				for(var i=0; i < puzWindow.lvldata.stumps.length; i++)
				{
					var stump = puzWindow.lvldata.stumps[i];
					if(stump[0] == coord[0] && stump[1] == coord[1])
						return true;
				}
				return false;
			}

			//calculate span 1, the best match
			var pA = points[0].slice(0,2);
			var pB = points[1].slice(0,2);
			
			var diff = [pB[0]-pA[0],pB[1]-pA[1]];

			while(!isStump(puzWindow, pA) && pA[0] >= 0 && pA[0] < puzWindow.lvldata.width
				&& pA[1] >= 0 && pA[1] < puzWindow.lvldata.height)
			{
				pA[0] -= diff[0];
				pA[1] -= diff[1];
			}


			while(!isStump(puzWindow,pB) && pB[0] >= 0 && pB[0] < puzWindow.lvldata.width
				&& pB[1] >= 0 && pB[1] < puzWindow.lvldata.height)
			{
				pB[0] += diff[0];
				pB[1] += diff[1];
			}

			var span1 = false;

			if(pA[0] >= 0 && pA[0] < puzWindow.lvldata.width
				&& pA[1] >= 0 && pA[1] < puzWindow.lvldata.height
				&& pB[0] >= 0 && pB[0] < puzWindow.lvldata.width
				&& pB[1] >= 0 && pB[1] < puzWindow.lvldata.height)
			{
				span1 = [pA,pB];
				
			}

			//calculate span 2, another match in case first isn't good
			pA = points[0].slice(0,2);
			pB = points[2].slice(0,2);
			
			diff = [pB[0]-pA[0],pB[1]-pA[1]];

			while(!isStump(puzWindow, pA) && pA[0] >= 0 && pA[0] < puzWindow.lvldata.width
				&& pA[1] >= 0 && pA[1] < puzWindow.lvldata.height)
			{
				pA[0] -= diff[0];
				pA[1] -= diff[1];
			}


			while(!isStump(puzWindow,pB) && pB[0] >= 0 && pB[0] < puzWindow.lvldata.width
				&& pB[1] >= 0 && pB[1] < puzWindow.lvldata.height)
			{
				pB[0] += diff[0];
				pB[1] += diff[1];
			}

			var span2 = false;

			if(pA[0] >= 0 && pA[0] < puzWindow.lvldata.width
				&& pA[1] >= 0 && pA[1] < puzWindow.lvldata.height
				&& pB[0] >= 0 && pB[0] < puzWindow.lvldata.width
				&& pB[1] >= 0 && pB[1] < puzWindow.lvldata.height)
			
			{
				span2 = [pA,pB];
			}

			if(!span1 && span2)
			{
				span1 = span2.slice();
				span2 = undefined;
			}

			//move plank if one is held
			if(puzWindow.state.holding)
			{
				var heldPlank = puzWindow.state.planks[puzWindow.state.on];

				while(span1)
				{	
					var diff = Math.abs(span1[0][0] - span1[1][0] + span1[0][1] - span1[1][1]) 
					- Math.abs(heldPlank[0][0] - heldPlank[1][0] + heldPlank[0][1] - heldPlank[1][1]);
					
					if(diff == 0)
					{
						var planks = PlankPuzzles.accessiblePlanks(puzWindow);

						var touching = false;
						var overlapping = false;

						for(var i=0; i < planks.length; i++)
						{
							if(span1[0][0] == planks[i].p[0][0] && span1[0][1] == planks[i].p[0][1])
								touching = true;
							if(span1[0][0] == planks[i].p[1][0] && span1[0][1] == planks[i].p[1][1])
								touching = true;
							if(span1[1][0] == planks[i].p[0][0] && span1[1][1] == planks[i].p[0][1])
								touching = true;
							if(span1[1][0] == planks[i].p[1][0] && span1[1][1] == planks[i].p[1][1])
								touching = true;
						}

						var planks = puzWindow.state.planks;
						for(var i=0; i < planks.length; i++)
						{
							if(i != puzWindow.state.on && span1[0][0] == span1[1][0])
							{
								//vertical plank test for overlapping
								var lBound = planks[i][0][0];
								var rBound = planks[i][0][0];
								if(planks[i][1][0] < lBound)
									lBound = planks[i][1][0];
								if(planks[i][1][0] > rBound)
									rBound = planks[i][1][0];

								var tBound = span1[0][1];
								var bBound = span1[0][1];
								if(span1[1][1] < tBound)
									tBound = span1[1][1];
								if(span1[1][1] > bBound)
									bBound = span1[1][1];

								if(lBound < span1[0][0] && span1[0][0] < rBound
									&& tBound < planks[i][0][1] && planks[i][0][1] < bBound)
									overlapping = true;
							}
							else if(i != puzWindow.state.on)
							{
								//horizontal plank test for overlapping
								var lBound = span1[0][0];
								var rBound = span1[0][0];
								if(span1[1][0] < lBound)
									lBound = span1[1][0];
								if(span1[1][0] > rBound)
									rBound = span1[1][0];

								var tBound = planks[i][0][1];
								var bBound = planks[i][0][1];
								if(planks[i][1][1] < tBound)
									tBound = planks[i][1][1];
								if(planks[i][1][1] > bBound)
									bBound = planks[i][1][1];

								if(lBound < planks[i][0][0] && planks[i][0][0] < rBound
									&& tBound < span1[0][1] && span1[0][1] < bBound)
									overlapping = true;
							}

							function spansEqual(A,B)
							{
								if(A[0][0] == B[0][0] && A[0][1] == B[0][1])
									return (A[1][0] == B[1][0] && A[1][1] == B[1][1])
								else if(A[1][0] == B[0][0] && A[1][1] == B[0][1])
								{
									return (A[0][0] == B[1][0] && A[0][1] == B[1][1]);
								}

								return false;
							}

							if(spansEqual(planks[i],span1) && i != puzWindow.state.on)
								overlapping = true;
						}
						
						if(touching && !overlapping)
						{
							puzWindow.state.planks[puzWindow.state.on] = span1;
							puzWindow.state.holding = false;

							var pos = [];
							pos[0] = span1[0].slice();
							pos[1] = span1[0].slice();

							if(span1[1][0] < pos[0][0] )
								pos[0] = span1[1].slice();
							else if(span1[1][0] == pos[0][0] && span1[1][1] < pos[0][1])
								pos[0] = span1[1].slice();
							else
								pos[1] = span1[1].slice();

							var isMoveOldMove = false;

							if(puzWindow.history.moves[Math.floor(puzWindow.history.ptr)].pos != undefined)
							{
								var oldPos = puzWindow.history.moves[Math.floor(puzWindow.history.ptr)].pos;

								isMoveOldMove = (oldPos[0][0] == pos[0][0] && oldPos[0][1] == pos[0][1]
									&& oldPos[1][0] == pos[1][0] && oldPos[1][1] == pos[1][1]);
							}
							

							puzWindow.history.moves[Math.floor(puzWindow.history.ptr)] = {"plank": puzWindow.state.on, "pos":pos};
							puzWindow.history.ptr += .5;

							if(puzWindow.history.moves.length > puzWindow.history.ptr && !isMoveOldMove)
								puzWindow.history.moves = puzWindow.history.moves.slice(0,puzWindow.history.ptr);

							puzWindow.getElementsByClassName('Load')[0].style.display = "none";
							puzWindow.getElementsByClassName('Save')[0].style.display = "inline-block";
							PlankPuzzles.DrawUpdate(puzWindow);

							//display message if puzzle beat
							if((span1[0][0]== puzWindow.lvldata.end[0] && span1[0][1]== puzWindow.lvldata.end[1])
								|| (span1[1][0]== puzWindow.lvldata.end[0] && span1[1][1]== puzWindow.lvldata.end[1]))
							{

								PlankPuzzles.successDialog(puzWindow);
							}

							return;
						}
					}
					span1 = span2;
					span2 = false;
				}
			}
			//pick up plank if no plank is held
			else
			{
				function spansEqual(A,B)
				{
					if(A[0][0] == B[0][0] && A[0][1] == B[0][1])
						return (A[1][0] == B[1][0] && A[1][1] == B[1][1])
					else if(A[1][0] == B[0][0] && A[1][1] == B[0][1])
					{
						return (A[0][0] == B[1][0] && A[0][1] == B[1][1]);
					}

					return false;
				}

				var congruentPlanks = PlankPuzzles.accessiblePlanks(puzWindow);

				while(span1)
				{
					for(var i=0; i < congruentPlanks.length; i++)
					{
						if(spansEqual(span1, congruentPlanks[i].p))
						{
							puzWindow.state.on = congruentPlanks[i].i;
							puzWindow.state.holding = true;

							//prevents rewriting history if move is the same
							if(puzWindow.history.moves[puzWindow.history.ptr] == undefined
								|| puzWindow.history.moves[puzWindow.history.ptr].plank != puzWindow.state.on)
								puzWindow.history.moves[puzWindow.history.ptr] = {"plank":puzWindow.state.on};

							puzWindow.history.ptr += .5; 
							PlankPuzzles.DrawUpdate(puzWindow);

							puzWindow.getElementsByClassName('Load')[0].style.display = "none";
							puzWindow.getElementsByClassName('Save')[0].style.display = "inline-block";
							return;
						}
					}

					span1 = span2;
					span2 = false;
				}
				
			}
		}
	}
	catch(e)
	{
		console.error(e);
	}
}

PlankPuzzles.InitialDraw = function(puzWindow)
{
	//draw board

	var frontCanvas = puzWindow.getElementsByClassName('frontCanvas')[0];
	frontCanvas.getContext('2d').clearRect(0,0,puzWindow.offsetWidth, puzWindow.offsetHeight);
	var backCanvas = puzWindow.getElementsByClassName('backCanvas')[0];

	var ctx = backCanvas.getContext('2d');
	ctx.fillStyle = PlankPuzzles.color.Nearground;
	ctx.clearRect(0,0,puzWindow.offsetWidth, puzWindow.offsetHeight);

	ctx.fillRect(puzWindow.drwdata[0]+puzWindow.drwdata[2]/2,
		puzWindow.drwdata[1]-puzWindow.drwdata[2]/2,
		puzWindow.drwdata[2]*(puzWindow.lvldata.width-2),
		puzWindow.drwdata[2]*puzWindow.lvldata.height
	);

	//align counter
	var counterBox = puzWindow.getElementsByClassName('counter')[0];

	var bottomRightCornerX = puzWindow.offsetWidth - puzWindow.drwdata[0] ;//+ puzWindow.drwdata[0];
	var bottomRightCornerY = puzWindow.offsetHeight - puzWindow.drwdata[1] + puzWindow.drwdata[2]/2;

	//counterBox.style.left = (bottomRightCornerX + 0) + "px";
	counterBox.style.top = (bottomRightCornerY - 0) + "px";
	counterBox.style.zIndex = 1;

	counterBox.style.right = (puzWindow.offsetWidth-puzWindow.drwdata[0]-puzWindow.drwdata[2]/2
		-puzWindow.drwdata[2]*(puzWindow.lvldata.width-2)) + "px";


	// totalHeight - hieght
	var buttonHeight = 20;

	counterBox.innerHTML = "0";
	ctx.beginPath();

	//draw vertical lines
	for(var j=1; j < puzWindow.lvldata.width-1; j++)
	{
		ctx.moveTo(puzWindow.drwdata[0]+puzWindow.drwdata[2]*j, puzWindow.drwdata[1]);
		ctx.lineTo(puzWindow.drwdata[0]+puzWindow.drwdata[2]*j, 
			puzWindow.drwdata[1]+puzWindow.drwdata[2]*(puzWindow.lvldata.height-1));
	}
	//draw horizontal lines
	for(var j=0; j < puzWindow.lvldata.height; j++)
	{
		var startX = puzWindow.drwdata[0]+puzWindow.drwdata[2];
		var endX = puzWindow.drwdata[0]+puzWindow.drwdata[2]*(puzWindow.lvldata.width-2);
		if(j == puzWindow.lvldata.start[1])
			startX-= puzWindow.drwdata[2];
			
		if(j == puzWindow.lvldata.end[1])
			endX+= puzWindow.drwdata[2];

		ctx.moveTo(startX, puzWindow.drwdata[1]+puzWindow.drwdata[2]*j);
		ctx.lineTo(endX, puzWindow.drwdata[1]+puzWindow.drwdata[2]*j);
	}

	ctx.stroke();

	ctx.fillStyle = PlankPuzzles.color.Stump; 
	ctx.lineWidth = 1;
	ctx.strokeStyle = '#000000';
	for(var j=0; j < puzWindow.lvldata.stumps.length; j++)
	{
		var stump = puzWindow.lvldata.stumps[j];

		var goalStump = (stump[0] == 0 || stump[0]+1 == puzWindow.lvldata.width)
		if(goalStump)
			ctx.fillStyle = PlankPuzzles.color.GoalStump;

		ctx.beginPath();
		ctx.arc(puzWindow.drwdata[0]+puzWindow.drwdata[2]*stump[0],
			puzWindow.drwdata[1]+puzWindow.drwdata[2]*stump[1],
			puzWindow.drwdata[2]*.2, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.stroke();

		if(goalStump)
			ctx.fillStyle = PlankPuzzles.color.Stump;

	}
}

PlankPuzzles.DrawUpdate = function(puzWindow)
{
	//update counter
	var counterBox = puzWindow.getElementsByClassName('counter')[0];
	counterBox.innerHTML = Math.floor(puzWindow.history.ptr);

	//plank color #ffcc33
	var backCanvas = puzWindow.getElementsByClassName('frontCanvas')[0];
	var ctx = backCanvas.getContext('2d');
	
	var zx = puzWindow.drwdata[0];
	var zy = puzWindow.drwdata[1];
	var r = puzWindow.drwdata[2];

	var wid = r*.2;
	var gap = r*.1;

	ctx.clearRect(zx,zy-r,r*puzWindow.lvldata.width+r,r*puzWindow.lvldata.height+r);


	var connectedPlanks = PlankPuzzles.accessiblePlanks(puzWindow);
	while(connectedPlanks[0].p)
	{
		connectedPlanks.push(connectedPlanks.shift().i);
	}
	
	connectedPlanks.sort();

	for(var i=0; i < puzWindow.state.planks.length; i++)
	{
		var plank = puzWindow.state.planks[i];
		if(i == connectedPlanks[0])
		{
			connectedPlanks.shift();
			ctx.fillStyle = PlankPuzzles.color.Plank;
		}
		else
			ctx.fillStyle = PlankPuzzles.color.Stump;

		if(plank[0][0] - plank[1][0] == 0)
		{
			//vertical plank
			var top = plank[0][1];
			if(plank[1][1] < top)
				top = plank[1][1];
			var len = Math.abs(plank[0][1] - plank[1][1]);

			if(i != puzWindow.state.on || !puzWindow.state.holding )
				ctx.fillRect(zx+r*plank[0][0]-wid/2, zy+r*top+gap, wid, len*r-gap*2);
			ctx.strokeRect(zx+r*plank[0][0]-wid/2, zy+r*top+gap, wid, len*r-gap*2);

		}
		else
		{
			//horizontal plank
			var left = plank[0][0];
			if(plank[1][0] < left)
				left = plank[1][0];
			var len = Math.abs(plank[0][0] - plank[1][0]);

			if(i != puzWindow.state.on || !puzWindow.state.holding )
				ctx.fillRect(zx+left*r+gap, zy+r*plank[0][1]-wid/2, len*r-gap*2, wid);
			ctx.strokeRect(zx+left*r+gap, zy+r*plank[0][1]-wid/2, len*r-gap*2, wid);
		}
	}
}

PlankPuzzles.accessiblePlanks = function(puzWindow)
{
	var planks = ["placeholder"];

	for(var i=0; i< puzWindow.state.planks.length; i++)
	{
		if(i == puzWindow.state.on)
			planks[0] = {"p":puzWindow.state.planks[i],"i":i};
		else
			planks.push({"p":puzWindow.state.planks[i],"i":i});
	}

	//..h-1 connected planks with no unconnected plank neighbors
	//h..k-1 connect planks, need to check neighbors
	//k.. unconnected planks
	var h=0;
	var k=1;

	while(h<k)
	{
		for(var i=k; i < planks.length; i++)
		{
			var shareStump = false;
			
			if(planks[h].p[0][0] == planks[i].p[0][0] && planks[h].p[0][1] == planks[i].p[0][1])
				shareStump = true;
			if(planks[h].p[0][0] == planks[i].p[1][0] && planks[h].p[0][1] == planks[i].p[1][1])
				shareStump = true;
			if(planks[h].p[1][0] == planks[i].p[0][0] && planks[h].p[1][1] == planks[i].p[0][1])
				shareStump = true;
			if(planks[h].p[1][0] == planks[i].p[1][0] && planks[h].p[1][1] == planks[i].p[1][1])
				shareStump = true;

			if(shareStump)
			{
				var swap = planks[k];
				planks[k] = planks[i];
				planks[i] = swap;
				k++;
			}
		}
		h++;
	}

	//0..k-1 are connected

	return planks.slice(0,k);
}

PlankPuzzles.successDialog = function(puzWindow)
{
	var pasteDiv = document.createElement('div');
	pasteDiv.className = 'copybox';

	var innerDiv = document.createElement('div');
	innerDiv.className = "body";

	var textDiv = document.createElement('div');
	textDiv.className = 'msg';
	textDiv.innerHTML = 
		"<h2>Puzzle Complete</h2>\
		<p>Congratulations</p>";
	innerDiv.appendChild(textDiv);


	var buttonDiv = document.createElement('div');
	buttonDiv.className='buttons';
	
	var button2 = document.createElement('button');
	button2.innerHTML = "Return";
	button2.onclick = function()
	{
		var box = this.parentNode.parentNode.parentNode
		box.parentNode.removeChild(box);
	}
	buttonDiv.appendChild(button2);
	innerDiv.appendChild(buttonDiv);

	pasteDiv.appendChild(innerDiv);

	puzWindow.appendChild(pasteDiv);
}

PlankPuzzles.appInitialize();
