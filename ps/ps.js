
function showInfo(idx) {
  var md = document.getElementById("infoModal");
  document.getElementById("infoHdr").innerHTML=infoTitle[idx];
  document.getElementById("infoPara").innerHTML=infoStr[idx];
  md.style.display = "block"; 

}
function hideInfo() {
  var md = document.getElementById("infoModal");
  md.style.display = "none";
}

var infoTitle = [ 
  "GapFiller", "Unlucky Lock", "Dotsnake", "Beach jump maze",
  "Modality", "Soliquid", "Pip push paradise", "All green to blue",
  "Mortar", "Lab labyrinth", "Sokoboros", "Train Braining"
]
var infoStr = [ 
////////////////////////////////////////////////////////////////////////////////////
// GapFiller 
  "<b>Mechanic:</b> Space-filling block-pusher<br> \
    <b>Goal:</b> Fill the grid<br> \
    <b>Hint:</b> Try not to spawn blocks without a plan what to do with them <br>\
    <b>Difficulty:</b> Easy/Medium - <b>Levels:</b> 10 <br> \
    <b>Why selected:</b> A perfect example of what PS excels at",
// Unlucky Lock 
  "<b>Mechanic:</b> Colour-matching block-pusher<br> \
    <b>Goal:</b> Cover all goals<br> \
    <b>Hint:</b> A row of blocks can still be pushed (but can't be separated) <br> \
    <b>Difficulty:</b> Medium - <b>Levels:</b> 7 <br>\
    <b>Why selected:</b> Satisfying minimalist puzzles on compact grids",
// Dot snake
  "<b>Mechanic:</b> Snake-themed route-finder<br> \
    <b>Goal:</b> Consume the dots and reach the exit<br> \
    <b>Hint:</b> Don't block your own path <br> \
    <b>Difficulty:</b> Easy - <b>Levels:</b> 12 <br>\
    <b>Why selected:</b> The first PS-app I explored to the end - and then found myself addicted",
// Beach-jump maze 
  "<b>Mechanic:</b> Leap-frogging maze<br> \
    <b>Goal:</b> Find the right exit<br> \
    <b>Hint:</b> Explore all passageways and beware of false goals<br> \
    <b>Difficulty:</b> Easy/Medium - <b>Levels:</b> 10 <br>\
    <b>Why selected:</b> A colourful unpretentious maze-romp",

////////////////////////////////////////////////////////////////////////////////////
// Modality
  "<b>Mechanic:</b> Escher-styled block-pusher<br> \
    <b>Goal:</b> Push block to goal<br> \
    <b>Hint:</b> Explore the grey portal<br> \
    <b>Difficulty:</b> Easy/Medium <b>Levels:</b> 4 <br> \
    <b>Why selected:</b> Clever use of dead-space - why waste the walls!?",
// Soliquid
  "<b>Mechanic:</b> Shape-morphing block-pusher<br> \
    <b>Goal:</b> Reach the goal in the correct size and shape<br> \
    <b>Hint:</b> Keep in mind the blob is 3x3 max<br> \
    <b>Difficulty:</b> Medium - <b>Levels:</b> 11 <br>\
    <b>Why selected:</b> Nice element of new rule discovery in later levels",
// Pip-push-paradise 
  "<b>Mechanic:</b> Dice-themed rolling-block<br> \
    <b>Goal:</b> Cover the goals in the correct orientation<br> \
    <b>Hint:</b> A line of pushed dice don't roll<br> \
    <b>Difficulty:</b> Medium/Hard - <b>Levels:</b> 13 <br>\
    <b>Why selected:</b> Elegant use of 2D graphics to convey a 3D puzzle",
// All green-to-blue 
    "<b>Mechanic:</b> Multi-state block-pusher<br> \
    <b>Goal:</b> Turn all green blocks blue<br> \
    <b>Hint:</b> Keep the green blocks mobile<br> \
    <b>Difficulty:</b> Medium/Hard - <b>Levels:</b> 10 <br>\
    <b>Why selected:</b> Multi-state blocks?! I wish I had thought of that",

////////////////////////////////////////////////////////////////////////////////////  
// Mortar 
  "<b>Mechanic:</b> Sokoban with hidden mechanic<br> \
    <b>Goal:</b> Push blocks to cover goal<br> \
    <b>Hint:</b> Explore the walls<br> \
    <b>Difficulty:</b> Medium/Hard - <b>Levels:</b> 10 <br>\
    <b>Why selected:</b> A first-level to die for (literally) - but it will eventually make sense",
// Lab Labyrinth 
  "<b>Mechanic:</b> Teleportation and duplication<br> \
    <b>Goal:</b> Cover all the goals simultaneously - with no redundancy<br> \
    <b>Hint:</b> You can reduce head-count as well as increase it<br> \
    <b>Difficulty:</b> Medium - <b>Levels:</b> 8 <br>\
    <b>Why selected:</b> A curiosity worthy of more exploration",
// Sokoboros 
  "<b>Mechanic:</b> Snake-themed dungeon-crawl<br> \
    <b>Goal:</b> Open all the gates to win<br> \
    <b>Hint:</b> Grow the snake and explore the red switches<br> \
    <b>Difficulty:</b> Easy/Medium <br> \
    <b>Why selected:</b> Well executed theme with a nice variety of puzzles",
// TrainBraining
  "<b>Mechanic:</b> Route-planning<br> \
    <b>Goal:</b> Build a one-pass route to deliver passengers to their destinations<br> \
    <b>Hint:</b> Use both sides of the station<br> \
    <b>Difficulty:</b> Medium/Hard - <b>Levels:</b> 11 <br> \
    <b>Why selected:</b> Simply a genius puzzle"
]
