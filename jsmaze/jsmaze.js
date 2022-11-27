
mazeA = new Array ([2,3,4,3,1],[3,2,1,3,3],[3,3,2,2,4],[3,1,2,3,4],[2,4,3,4,0]);
mazeB = new Array ([2,4,4,1,4,3],[2,1,4,1,3,3],[3,4,3,2,4,1],[4,4,3,2,1,3],[2,1,2,4,2,4],[1,3,2,2,3,0]);
mazeC = new Array ([2,1,3,4,1],[2,3,2,1,4],[4,3,2,2,1],[1,3,2,2,3],[3,1,2,1,4]);

function imgLoad() 
{
  imgFile = imgLoad.arguments;
  imgSrc = new Array();
  for (i=0; i<imgFile.length; i++) {
    imgSrc[i] = new Image;
    imgSrc[i].src = './gifs/red'+imgFile[i]+'.gif';
  }
}

function clickA(x,y) {
  var mazeID = 'mazeA';
  var z = mazeA[x][y];
  updateImg(mazeID, x,y,z, 5);
}
function clickB(x,y) {
  var mazeID = 'mazeB';
  var z = mazeB[x][y];
  updateImg(mazeID, x,y,z, 6);
}
function clickC(x,y) {
  var mazeID = 'mazeC';
  var z = mazeC[x][y];
  updateImg(mazeID, x,y,z, 5);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateImg(mazeID, x,y,z, dim)
{
  var currImg = document.images[mazeID+x+y];

  if (currImg.src.indexOf('next') != -1) 
  {
    currImg.src='./gifs/red.gif';
    var unvisited = 0;

    for (a=0; a<dim; a++) {
      for (b=0; b<dim; b++) {
        fixImg = document.images[mazeID+a+b];
        var q1 = fixImg.src.indexOf('red');
        if ( q1 == -1 ) { fixImg.src = './gifs/blank.gif'; unvisited++; }
        else            { fixImg.src = './gifs/red.gif'; }
      }
    }

    var modify = new Array ([-z,0],[0,-z],[z,0],[0,z]);
    for (i=0; i<4; i++) {
      if (testImg = document.images[mazeID+(x+modify[i][0])+(y+modify[i][1])])  { 
          var q2 = testImg.src.indexOf('red');
          if ( q2 == -1 ) { testImg.src = './gifs/blank_next.gif'; }
          else            { testImg.src = './gifs/red_next.gif'; }
        }
    } 

    if (z == 0 ) { 
      currImg.src='./gifs/goal.gif'; 
      await sleep(100); 
      alert('You solved the maze! Hurrah!');
    }
    else if ( unvisited == 0 ) { 
      await sleep(100); 
      alert('You filled the grid! Hurrah!');
    }
    else { currImg.src='./gifs/red_spin_'+z+'.gif'; }
  } 
  else { alert('You can only move the number of squares specified.'); }
}
