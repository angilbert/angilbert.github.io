var heldLetterEl = null;
var initComplete = false;
var nCount=0, yCount=0;
var yList="", nList="";
var level=0;
var currentGoal="";
var availableLetters="";
var letterslocked;

var searchArray = [];
var currentTargetWords = [];
var allTargetWords = [ "ZERO",
    "ONE","TWO","THREE","FOUR","FIVE",
    "SIX","SEVEN","EIGHT","NINE","TEN",
    "ELEVEN","TWELVE","THIRTEEN","FOURTEEN","FIFTEEN",
    "SIXTEEN","SEVENTEEN","EIGHTEEN","NINETEEN",
    "TWENTY", "TWENTYONE","TWENTYTWO","TWENTYTHREE","TWENTYFOUR","TWENTYFIVE",
    "TWENTYSIX","TWENTYSEVEN","TWENTYEIGHT","TWENTYNINE",
    "THIRTY", "THIRTYONE","THIRTYTWO","THIRTYTHREE","THIRTYFOUR","THIRTYFIVE",
    "THIRTYSIX","THIRTYSEVEN","THIRTYEIGHT","THIRTYNINE",
    "FORTY", "FORTYONE","FORTYTWO","FORTYTHREE","FORTYFOUR","FORTYFIVE",
    "FORTYSIX","FORTYSEVEN","FORTYEIGHT","FORTYNINE",
    "FIFTY", "FIFTYONE","FIFTYTWO","FIFTYTHREE","FIFTYFOUR","FIFTYFIVE",
    "FIFTYSIX","FIFTYSEVEN","FIFTYEIGHT","FIFTYNINE",
    "SIXTY", "SIXTYONE","SIXTYTWO","SIXTYTHREE","SIXTYFOUR","SIXTYFIVE",
    "SIXTYSIX","SIXTYSEVEN","SIXTYEIGHT","SIXTYNINE",
    "SEVENTY", "SEVENTYONE","SEVENTYTWO","SEVENTYTHREE","SEVENTYFOUR","SEVENTYFIVE",
    "SEVENTYSIX","SEVENTYSEVEN","SEVENTYEIGHT","SEVENTYNINE",
    "EIGHTY", "EIGHTYONE","EIGHTYTWO","EIGHTYTHREE","EIGHTYFOUR","EIGHTYFIVE",
    "EIGHTYSIX","EIGHTYSEVEN","EIGHTYEIGHT","EIGHTYNINE",
    "NINETY", "NINETYONE","NINETYTWO","NINETYTHREE","NINETYFOUR","NINETYFIVE",
    "NINETYSIX","NINETYSEVEN","NINETYEIGHT","NINETYNINE"
];

////////////////////////////////////////////////////////////////////////////////////
// Initialisation & puzzle loading functions
////////////////////////////////////////////////////////////////////////////////////

function revealByClass(cls) {    
    var set = document.getElementsByClassName(cls);
    Array.prototype.forEach.call(set, function(el) { 
        el.style.visibility = "visible"; 
        el.style.display = "block";
    });
}
function updateButtonSet(boolVal, cls) {
    var set = document.getElementsByClassName(cls);
    Array.prototype.forEach.call(set, function(butt) 
        { butt.disabled = boolVal; });
}

function placeInGrid(letter, cell) { 
    clickLetterGrid(document.getElementById(letter));
    clickPuzzGrid(document.getElementById(cell));
}

function loadP1() {
    level=1;
    initComplete = false;   
    placeInGrid("W","M20"); placeInGrid("T","M40"); 
    placeInGrid("E","M01"); placeInGrid("E","M31"); 
    placeInGrid("L","M02"); placeInGrid("O","M22"); 
    placeInGrid("F","M32"); placeInGrid("V","M03");
    placeInGrid("N","M04"); placeInGrid("U","M24");
    placeInGrid("R","M34"); placeInGrid("H","M44");
    // we want both grid disabled with specific cells enabled
    updateButtonSet(true, "PZ");  
    updateButtonSet(true, "LT");  
    updateButtonSet(false, "PZ empty");
    document.getElementById("M04").disabled = false;
    document.getElementById("I").disabled = false;
    currentGoal=" \
Add an <b>I</b> and reposition <b>N</b>  \
so that <b>ONE</b> and <b>FIVE</b> are added to the found list.";
    availableLetters="Available letters:";
    letterslocked = true;   // block letter discard
    initComplete = true;    // enable checkForWin
    setGoal([1,2,3,4,5,11], -1,-1);
}

function loadP2() {     // assumes level1 is in solved state 
    updateButtonSet(false, "PZ");
    updateButtonSet(true, "LT");        
    currentGoal=" \
Rearrange the letters to add <b>NINE</b> and <b>TEN</b> \
to the found list.";
    availableLetters="Available letters: (none)";
    letterslocked=true;
    setGoal([1,2,3,4,5,9,10,11], -1,-1);
}

function loadP3() {         // 10-20
    reinit();               
    initComplete = false;   
    placeInGrid("T","M12"); 
    placeInGrid("E","M22"); 
    placeInGrid("N","M32"); 
    currentGoal=" \
Fill the grid to satisfy all numbers from \
<b>TEN to TWENTY</b> inclusive.";
    // make sure only the empty grid cell buttons are enabled
    updateButtonSet(true, "PZ");
    updateButtonSet(false, "PZ empty");
    availableLetters="Unlimited letters:";
    setGoal([], 10,20);
}

function loadP4() {     //  1-99
    reinit();           
    currentGoal=" \
Fill the grid to satisfy all numbers from \
<b>ONE to NINETYNINE</b> inclusive.";

    availableLetters="Unlimited letters:";
    setGoal([], 1,99);
}

function loadP5() {     //  0-99
    reinit();           
    initComplete = false;   
    placeInGrid("Z","M00"); placeInGrid("E","M10"); 
    placeInGrid("R","M20"); placeInGrid("O","M30"); 
    currentGoal=" \
Fill the grid to satisfy all numbers from \
<b>ZERO to NINETYNINE</b> inclusive.";
    
    // make sure only the empty grid cell buttons are enabled
    updateButtonSet(true, "PZ");
    updateButtonSet(false, "PZ empty");

    availableLetters="Unlimited letters:";
    setGoal([], 0,99);
}

function setGoal(goallist, min, max) 
{
    var i;
    for (i=0; i<allTargetWords.length ; i+=1) 
        { currentTargetWords[i] = false; }    
    for (i=0; i<goallist.length; i++)      // specific goals
        { currentTargetWords[(goallist[i])] = true; }
    for (i=min; i<=max; i++)                 // range of goals
        { currentTargetWords[i] = true; }
    
    document.getElementById("p-currentgoal").innerHTML = currentGoal;
    document.getElementById("p-availableletters").innerHTML = availableLetters;
    document.getElementById("p-level").innerHTML = "Level: "+level;

    initComplete = true;
    checkForWin();
}

function reinit() // used from level3
{     
    searchArray = [];
    for (var i=0; i<5; i+=1) {
        searchArray.push([]);
        for (var j=0; j<5; j+=1) 
            { searchArray[i].push('?'); }
    }
    currentTargetWords = [];
    for (var j=0; j<allTargetWords.length ; j+=1) 
        { currentTargetWords.push(false); }

    var set = document.getElementsByClassName("PZ");
    Array.prototype.forEach.call(set, function(b) { 
        b.className = "PZ empty"; 
        b.textContent = '?';
    });
    set = document.getElementsByClassName("LT");
    Array.prototype.forEach.call(set, function(b) { 
        b.className = "LT avail"; 
    });
    updateButtonSet(false, "PZ");   
    updateButtonSet(false, "LT"); 
    letterslocked=false;
}

function initGrid() {
    reinit();
    loadP1(); 
}

////////////////////////////////////////////////////////////////////////////////////
// Event handling functions
////////////////////////////////////////////////////////////////////////////////////

function showHint() {
    alert(
"Hint for level 4: Position the Y anywhere on the grid and then consider what \
letters must link with Y (before or after). Put all these letters in the same \
row or column as Y and then use this as framework to start building the target words." );
}

function clickPuzzGrid(gridEl) 
{ 
    var classStr = gridEl.className;
    var prevLetterEl = null; 

    if (classStr != "PZ empty") { 
        var clist = classStr.split(" ");
        prevLetterEl = document.getElementById(clist[1]); }

    if (prevLetterEl == null && heldLetterEl == null) 
            { return; } // nothing to do

    if (prevLetterEl == null && heldLetterEl != null) { 
        // put the held letter into the grid cell
        gridEl.className = "PZ "+heldLetterEl.id;
        gridEl.textContent = heldLetterEl.textContent;
        updateLetterButtons(null,null,heldLetterEl);
    }
    else if (prevLetterEl != null && heldLetterEl == null) { 
        // pick up the clicked letter from the grid
        gridEl.className = "PZ empty";
        gridEl.textContent = '?';
        updateLetterButtons(null,prevLetterEl,null);
    }
    else if (prevLetterEl != null && heldLetterEl != null) { 
        if (letterslocked) { return; }
        // discard the held letter and pick up the clicked letter
        gridEl.className = "PZ empty";
        gridEl.textContent = '?';
        updateLetterButtons(heldLetterEl,prevLetterEl,null);
    }
    updateSearchArray(gridEl);
    if (!initComplete) { return; }
 
    document.getElementById("LevelUp").disabled = true;
    if ( checkForWin() == 0) setTimeout(function() { 
        var msg="Congratulations!"
        if (level <= 3) msg += "\nClick Level-Up to continue";
        if (level == 4) msg += "\nYou might want to take a screenshot before the final level";
        if (level == 5) msg += "\nYou solved all 5 levels - Job done";
        alert(msg);
        if (level < 5) { document.getElementById("LevelUp").disabled = false; }
    }, 100);
}

function updateLetterButtons(elA, elH, elP) {
    heldLetterEl = null;
    if (elA != null) {  
        elA.className = "LT avail";
    }
    if (elH != null) { 
        elH.className = "LT inhand"; 
        heldLetterEl = elH;
    }
    if (elP != null) {  
        if ( letterslocked ) 
                { elP.className = "LT inplay"; }
        else    { elP.className = "LT avail"; }
    }
}

function clickLetterGrid(el) {
    // if the letters are locked - protect the held letter 
    if (letterslocked && heldLetterEl != null) { return; }

    if (el == heldLetterEl) // drop a held letter
         { updateLetterButtons(heldLetterEl,null,null); }
    else { updateLetterButtons(heldLetterEl,el,null); }
}

function clickLevelUp() {
    level++;
    if (level == 2) loadP2();
    if (level == 3) loadP3();
    if (level == 4) loadP4();
    if (level == 5) loadP5();
    document.getElementById("LevelUp").disabled = true;
}

function jumpToLevel(n) {
    level=n;
    if (n == 3) loadP3();
    if (n == 4) loadP4();
    if (n == 5) loadP5();
}

////////////////////////////////////////////////////////////////////////////////////
// Search functions
////////////////////////////////////////////////////////////////////////////////////

function updateSearchArray(gridEl) {
    var x = gridEl.id.charAt(1);
    var y = gridEl.id.charAt(2);
    searchArray[y][x] = gridEl.textContent;
}

function findWord(str) {
    for (var y=0; y<5; y++) {
        for (var x=0; x<5; x++) { 
            if (searchArray[y][x] == str.charAt(0)) 
                { if ( letterScan(x,y,str,1) ) { return true; } } 
        }           
    }
    return false;
}

function letterScan(x,y,str,z) {
    //console.log("letterScan: xyz:"+x+y+z+" str:"+str);
    if (z == str.length) { return true; }   // success!

    for (var i=0; i<5 ; i++) {      // search the row for next char
        if (i==x) { continue; }     // skip current cell
        if (searchArray[y][i] == str.charAt(z)) 
            { if ( letterScan(i,y,str,z+1) ) { return true; } } 
    }
    for (var i=0; i<5 ; i++) {      // search the column for next char
        if (i==y) { continue; }     // skip current cell
        if (searchArray[i][x] == str.charAt(z)) 
            { if ( letterScan(x,i,str,z+1) ) { return true; } } 
    }
    return false;
}

function checkForWin() {
    nCount=0; yCount=0;
    yList=""; nList=""; 
    for (var i=0; i<currentTargetWords.length; i++) {
        if (currentTargetWords[i] == false) continue;
        if (findWord(allTargetWords[i]) == true) 
                { yCount++; yList+=allTargetWords[i]+" "; }
        else    { nCount++; nList+=allTargetWords[i]+" "; }
    } 
    document.getElementById("h-found").innerHTML = "Found: ("+yCount+")";
    document.getElementById('numlistSolved').value=yList;
    document.getElementById("h-missing").innerHTML = "Missing: ("+nCount+")";
    document.getElementById('numlistToDo').value=nList;
    return nCount;  // return the missing count 
}






