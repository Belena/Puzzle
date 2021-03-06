// Define initial variables. Number of tiles, size of one tile in pixels and initial timer
var NumberOfTiles = 16;
var tile_size = 160;
var current_timer = 0;



// Creates initial game board layout with 16 divs
var InitPuzzle = (function() {
  var boardSize = (tile_size * 4) + "px";

  $("#board").css({ position:"absolute", width: boardSize, height: boardSize, border: "1px solid grey" });

  // Populate the game board's HTML container with 16 squares(divs)
  for (var i = 0; i < NumberOfTiles; i++) {
    // Creating a div and append it into HTML board dynamically
    // Each square uses the same image. It just uses a different x/y offset(left-top coordinates) for each square
    $("#board").append("<div id='tile" + (i + 1) + "'></div>")
    $("div#tile" + (i + 1)).css({
        width: tile_size + "px",
        height: tile_size + "px",
        left: ((i % 4) * tile_size) + "px",
        top: Math.floor(i / 4) * tile_size + "px",
        backgroundPosition: -(i % 4) * tile_size + "px " + (-Math.floor(i / 4) * tile_size) + "px"
      });
  }
  // Use the last tile as blank i.e. set background to white
  $('#board').children("div:nth-child(" + NumberOfTiles + ")").css({backgroundImage: "", background: "#ffffff"});
});



// Shuffles puzzle
var Shuffle = (function() {
  var i = 0;
  // How many shuffle movements to do.
  var rounds = 3;
  // Pick random tile and try to move it. If it's movable - increment counter. If not - try again.
  while (i < rounds)  {
    var randomnumber = (Math.floor(Math.random()*15)+1);
    var nth_child = "div:nth-child(" + randomnumber + ")";
    // We need only an HTML div element of randomly chosen jQuery object ([0]) to pass it as Move() argument
    var cur_tile = $("#board").children(nth_child)[0];
    if (Move(cur_tile)) {
      i++;
    }
  }
});



// Move takes 1 element (e.g tile that was clicked) and tries to move it
// If it's possible to move this object - moves and returns true
// If object is not movable (not adjacent to an empty square) - returns false
var Move = (function(clicked_tile) {
  // consider object as not movable by default
  is_movable = false;
  
  // Get current coordinates of an empty square(16-th div) to compare then
  var oldx = $("#board").children("div:nth-child(" + NumberOfTiles + ")").css("left");
  var oldy = $("#board").children("div:nth-child(" + NumberOfTiles + ")").css("top");
  
  // Get coordinates of a clicked tile
  var newx = $(clicked_tile).css("left");
  var newy = $(clicked_tile).css("top");
  
  // Check whether clicked tile is adjacent to an empty tile
  if (oldx == newx) {
    // The clicked square is upper of the empty square?
    if (newy == (parseInt(oldy) - tile_size) + "px") {
      is_movable = true;
      // The clicked square is lower of the empty square?
    } else if (newy == (parseInt(oldy) + tile_size) + "px") {
       is_movable = true;
      }
    //in case they are in the same row
  } else if (newy == oldy) {
    // The clicked square is left of the empty square?
    if (newx == (parseInt(oldx) - tile_size) + "px") {
      is_movable = true;
      // The clicked square is right of the empty square?
    } else if (newx == (parseInt(oldx) + tile_size) + "px") {
        is_movable = true;
      }
  }
  // If it's movable - try to move tile (swap coordinates!)
  if (is_movable) {
    // Assign new coordinates for the empty square
    $("#board").children("div:nth-child(" + NumberOfTiles + ")").css("left", newx);
    $("#board").children("div:nth-child(" + NumberOfTiles + ")").css("top", newy);

    // Assign coordinates of the old empty square to the clicked square
    $(clicked_tile).css("left", oldx);
    $(clicked_tile).css("top", oldy);

    return true;
  } else {
      return false;
  }
});




// Checks whether puzzle is solved by comparing initial layout with current.
// Returns true if puzzle is solved, false otherwise.
var Check = (function() {
  for (var i = 0; i < NumberOfTiles; i++) {
    var chld_num = i + 1;

    // Get coordinates of current div element (tile)
    var cur_x = $("#board").children("div:nth-child(" + chld_num + ")").css("left");
    var cur_y = $("#board").children("div:nth-child(" + chld_num + ")").css("top");
    
    // Compute initial coordinates of this div element
    var init_x = ((i % 4) * tile_size) + "px";
    var init_y = Math.floor(i / 4) * tile_size + "px";

    // If coordinates do not match to initial - puzzle is not solved. Stop checking.
    if (cur_x != init_x || cur_y != init_y) {
      return false;
    }
  }
  return true;
});




// Increments current timer and displays it on the page
var ShowTimer = (function() {
  current_timer++;
  $("#timer").text(current_timer);
});



// Creates AJAX request to load score submition form and place it on the page
var PreloadForm = (function(){
  $.ajax({
    url: "/scores/new",
    type: "GET",
    error: AjaxError,
    success: function(result_content) {
      $("div#score_form").html(result_content);
      $("form#new_score").on("submit", SubmitForm);
    }
  });
});



// Simple AJAX error handler
var AjaxError = (function() {
  alert("Something went wrong... AJAX failed!");
});




// Submits score form to server with AJAX request, validate
var SubmitForm = (function(e) {
  e.preventDefault();
  var namevalue = $("input#score_name").val();

  // Simple name field validation
  if (namevalue == null || namevalue == ""){
    alert("Enter your name!");
  } 
  else {
    $.ajax({
      url: "/scores",
      type: "POST",
      data: $("form#new_score").serialize(),
      error: AjaxError,
      success: function() {
        $("div#result_page").hide();
        $("div#gallery").show();
        $("div#top_scores").show();
        $("div#header").fadeIn(1000);

        alert("Congratulations, "+ namevalue + "! Your score has been successfully added.");
      }
    });
  }
  return false;
});




// Loads top player from server with AJAX and displays result on the scoreboard
var LoadTopPlayers = (function() {
 $.ajax({
    url: "/scores",
    type: "GET",
    error: AjaxError,
    success: function(result_content) {
      $("div#top_scores").html(result_content);
    }
  }); 
});



// START 
$(document).ready(function() {
  var timer;

  PreloadForm();
  LoadTopPlayers();
  setInterval(LoadTopPlayers, 5000);

  // Hide main game panel and results page at the start
  $("div#game_object").hide();
  $("div#result_page").hide();

  // Create main game panel
  InitPuzzle();


  // Attach click event to each square of the puzzle
  $("#board").children("div").on("click", function() {
    Move(this);

    // We want to check if puzzle was solved after every move
    if (Check()) {
      // Solved!
      clearInterval(timer);
      alert("You solved it! Time spent: " + current_timer + " seconds.");
      // Put time result into score submit form
      $("input#score_time").val(current_timer);

      // Reset timer
      current_timer = 0;
      ShowTimer();
     
      $("div#game_object").hide(1000);
      $("div#header").hide();
      $("div#top_scores").hide();
      $("div#result_page").fadeIn(1000);
    }
  }); // end of onClick handler



  // If any of the pictures was clicked - use this picture as puzzle and start game
  $("img.pictures").on("click", function() {
    $("div#gallery").hide();

    // Get a description for the chosen picture and load it into the hidden div. We'll show it later when user wins.
    var picinfo = $(this).data("answer");
    $("div#answer").html(picinfo);
    
    // Start a timer
    timer = setInterval(ShowTimer, 1000);

    // Use src of the clicked picture to place it into the puzzle
    pic_src = $(this).attr("src");

    // We want to attach chosen image background to squares number 1-15 only (16th is an empty one)
    $("div#board").children("div:nth-child(-n+15)")
      .css("background-image", "url(" + pic_src + ")");

    // Finally, show our puzzle to a user
    $("#game_object").fadeIn(500)

    // Shuffle the puzzle
    Shuffle();
  }); // end of onClick handler

});


