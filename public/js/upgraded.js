// Define initial variables. 
var TilesPerSide = 4;
// Size of picture's side in px
var PictureSize = 640;
// Total number of tiles in puzzle
var TilesNumber = TilesPerSide * TilesPerSide;
// Size of one tile in px
var tile_size = PictureSize / TilesPerSide;

var current_timer = 0;

// Creates initial game board layout with 16 divs
var InitPuzzle = (function() {
  var boardSize = (tile_size * TilesPerSide) + "px";

  $("#board").css({ position:"absolute", width: boardSize, height: boardSize, border: "1px solid gray" });

  var tile_width_height_css = "width: " + tile_size + "px; height: " + tile_size + "px;"

  // Populate the game board's HTML container with 16 squares
  for (var i = 0; i < TilesNumber; i++) {
    
    // Creating a div and append it into HTML dynamically
    // Each square uses the same image. It just uses a different x/y offset for each square
    var tile_left_css = "left: " + ((i % TilesPerSide) * tile_size) + "px; "
    var tile_top_css = "top: " + Math.floor(i / TilesPerSide) * tile_size + "px; "
    var tile_bg_pos = "background-position: " + (-(i % TilesPerSide) * tile_size) + "px " + -Math.floor(i / TilesPerSide) * tile_size + "px;"
    $("#board").append("<div style='" + tile_left_css + tile_top_css + tile_width_height_css + tile_bg_pos + "'></div>");
  }

  // Use the last tile as empty i.e. change it background to white
  $('#board').children("div:nth-child(" + TilesNumber + ")").css({backgroundImage: "", background: "#ffffff"});
});

// Shuffles puzzle
var Shuffle = (function() {
  var i = 0;
  // How many shuffle movements to do.
  var rounds = 3;

  // Pick random tile and try to move it. If it's movable - increment counter. If not - try again.
  while (i < rounds)  {
    var randomnumber = Math.floor(Math.random()*(TilesNumber - 1));
    var nth_child = "div:nth-child(" + randomnumber + ")";
    // We need an "outer" HTML div element of chosen jQuery object ([0]) to pass it as Move() argument
    var cur_tile = $("#board").children(nth_child)[0];
    if (Move(cur_tile)) {
      i++;
    }
  }
});


// Move() is the function that is called when a square is clicked
// It takes 1 element - object that was clicked and tries to move it
// If it's possible to move this object - moves and returns true
// If object is not movable (not adjacent to an TilesNumber) - returns false
var Move = (function(clicked_tile) {
  // consider object as not movable by default
  is_movable = false;

  // Get coordinates of a current empty square
  var oldx = $("#board").children("div:nth-child(" + TilesNumber + ")").css("left");
  var oldy = $("#board").children("div:nth-child(" + TilesNumber + ")").css("top");

  // Get coordinates of a clicked tile
  var newx = $(clicked_tile).css("left");
  var newy = $(clicked_tile).css("top");

  
  // Check whether clicked tile is adjacent to an empty one
  if (oldx == newx) {
    // The clicked square is upper of the empty square
    if (newy == (parseInt(oldy) - tile_size) + "px") {
      is_movable = true;
      // The clicked square is lower of the empty square
    } else if (newy == (parseInt(oldy) + tile_size) + "px") {
       is_movable = true;
      }
  } else if (newy == oldy) {
    // The clicked square is left of the empty square
    if (newx == (parseInt(oldx) - tile_size) + "px") {
      is_movable = true;
      // The clicked square is right of the empty square
    } else if (newx == (parseInt(oldx) + tile_size) + "px") {
        is_movable = true;
      }
  }

  // Try to move if it's movable
  if (is_movable) {
    // Assign new coordinates for the empty square
    $("#board").children("div:nth-child(" + TilesNumber + ")").css("left", newx);
    $("#board").children("div:nth-child(" + TilesNumber + ")").css("top", newy);

    // Assign coordinate of the old empty square to the clicked square
    $(clicked_tile).css("left", oldx);
    $(clicked_tile).css("top", oldy);

    return true;
  } else {
      return false;
  }
});


// Checks whether puzzle is solved.
// Compares initial layout with current.
// Returns true if puzzle is solved, false otherwise.
var Check = (function() {

  for (var i = 0; i < TilesNumber; i++) {
    var chld_num = i + 1;

    // Get coordinates of current div element (tile)
    var cur_x = $("#board").children("div:nth-child(" + chld_num + ")").css("left");
    var cur_y = $("#board").children("div:nth-child(" + chld_num + ")").css("top");
    
    // Compute initial coordinates of this div element
    var right_x = ((i % TilesPerSide) * tile_size) + "px";
    var right_y = Math.floor(i / TilesPerSide) * tile_size + "px";

    // If coordinates do not match to initial - puzzle is not solved. Stop checking.
    if (cur_x != right_x || cur_y != right_y) {
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

// Creates AJAX request to load score submit form and place it on the page
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


// Submits score form to server with AJAX request
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
        $("div#game_header").show();
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
     
      $("div#game_object").hide(1000);
      $("div#header").hide();
      $("div#top_scores").hide();
      $("div#result_page").fadeIn(1000);
      // Reset timer
      current_timer = 0;
      ShowTimer();
    }
  }); // end of onClick handler

  // When user clicks any of pictures on the gallery - we use this picture as puzzle and start game
  $("img.pictures").on("click", function() {
    // Get a description for the chosen picture and load it into the hidden div. We'll show it when user wins.
    var picinfo = $(this).data("answer");
    $("div#answer").html(picinfo);
    
    $("div#game_header").hide();

    // Start a timer
    timer = setInterval(ShowTimer, 1000);

    // Use src of the clicked picture to place it into the puzzle
    pic_src = $(this).attr("src");

    // We want to attach chosen image as a background to squares number 1-15 only (16th is an empty one)
    var background_children = "div:nth-child(-n+" + (TilesNumber - 1) + ")";
    $("div#board").children(background_children).css("background-image", "url(" + pic_src + ")");

    // Shuffle the puzzle
    Shuffle();

    // Finally, show our puzzle to a user
    $("#game_object").fadeIn(500)

    
  }); // end of onClick handler

});


