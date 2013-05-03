var EmptySquare = 16;
var square_size = 145;
var zi = 1; // We increment z-index each time a square is shifted
var current_timer = 0;

function InitPuzzle() {
  var sqSize = square_size + 'px';
  var boardSize = (square_size * 4) + 'px';

  $('#board').css({ position:'absolute', width: boardSize, height: boardSize, border: '1px solid gray' });

  var tile_width_height_css = "width: " + square_size + "px; height: " + square_size + "px;"

  // Populate the game board's HTML container with 15 squares
  for (var i = 0; i < 16; i++) {
      // A dirty way to create an arbitrary DIV and append it into HTML dynamically
      // Notice each square uses the same image. It just uses a different x/y offset for each square
      var tile_left_css = "left: " + ((i % 4) * square_size) + "px; "
      var tile_top_css = "top: " + Math.floor(i / 4) * square_size + "px; "
      var tile_bg_pos = "background-position: " + (-(i % 4) * square_size) + "px " + -Math.floor(i / 4) * square_size + "px;"
      $('#board').append("<div style='" + tile_left_css + tile_top_css + tile_width_height_css + tile_bg_pos + "'></div>");
  }

  // Empty up the empty_square, as the starting point
  $('#board').children("div:nth-child(" + EmptySquare + ")").css({backgroundImage: "", background: "#ffffff"});
}

function Shuffle () {
  var i = 0;
  var rounds = 3;

  while (i < rounds)  {
    var randomnumber = Math.floor(Math.random()*15);
    var nth_child = "div:nth-child(" + randomnumber + ")";
    // We need a first HTML div element ([0]) of jquery's object set
    var cur_tile = $('#board').children(nth_child)[0];
    if (Move(cur_tile)) {
      i++;
    }
  }
}


// Move() is the function that is called when a square is clicked
// Note that it is independent of the plugin itself which is described above
// It takes two parameters,
//     1. object handle to the square that was clicked, and
//     2. the width of the square
function Move(clicked_square) {
  is_movable = false;

  // Swap x/y between the clicked square and the currently empty square
  var oldx = $('#board').children("div:nth-child(" + EmptySquare + ")").css('left');
  var oldy = $('#board').children("div:nth-child(" + EmptySquare + ")").css('top');

  var newx = $(clicked_square).css('left');
  var newy = $(clicked_square).css('top');

  
  if (oldx == newx) {
    // The clicked square is north of the empty square
    if (newy == (parseInt(oldy) - square_size) + 'px') {
      is_movable = true;
    } else if (newy == (parseInt(oldy) + square_size) + 'px') {
       is_movable = true;
      }
  } else if (newy == oldy) {
    // The clicked square is west of the empty square
    if (newx == (parseInt(oldx) - square_size) + 'px') {
      is_movable = true;
    } else if (newx == (parseInt(oldx) + square_size) + 'px') {
        is_movable = true;
      }
  }

  // Try to move it if it's movable
  if (is_movable) {
    // Increment zindex so the new tile is always on top of all others
    $(clicked_square).css('z-index', zi++);

    // Swap squares... Animate new square into old square position
    $('#board').children("div:nth-child(" + EmptySquare + ")").css('left', newx);
    $('#board').children("div:nth-child(" + EmptySquare + ")").css('top', newy);

    $(clicked_square).css('left', oldx)
    $(clicked_square).css('top', oldy)

    $(clicked_square).animate({ left: oldx, top: oldy }, 200)

    return true;
  } else {
      return false;
  }
}

function Check() {
  answer = true

  for (var i = 0; i < 16; i++) {
    var chld_num = i + 1
    var cur_x = $('#board').children("div:nth-child(" + chld_num + ")").css('left');
    var cur_y = $('#board').children("div:nth-child(" + chld_num + ")").css('top');
    // A dirty way to create an arbitrary DIV and append it into HTML dynamically
    // Notice each square uses the same image. It just uses a different x/y offset for each square
    var right_x = ((i % 4) * square_size) + "px"
    var right_y = Math.floor(i / 4) * square_size + "px"

    if (cur_x != right_x || cur_y != right_y) {
      answer = false
    }
  }

  if (answer) {
    return true
  } else {
    return false
  }
}

function ShowTimer() {
  current_timer++;
  $("#timer").text(current_timer);
}

function PreloadForm(){
  $.ajax({
    url: '/scores/new',
    type: 'GET',
    error: AjaxError,
    success: function(result_content) {
    $('div#score_form').html(result_content);
    $('form#new_score').on('submit', SubmitForm);

    }
  });
}

function AjaxError() {
  alert('Something went wrong... AJAX failed!');
}

function SubmitForm(e) {
  e.preventDefault();
 // console.log($('input#score_name').val());
 var namevalue = $('input#score_name').val();

  if (namevalue == null || namevalue == ""){
    alert("Enter your name!");
  } 
  else {
    $.ajax({
      url: '/scores',
      type: 'POST',
      data: $('form#new_score').serialize(),
      error: AjaxError,
      success: function() {
        $('div#result_page').hide();

        $('div#game_header').show();

        alert('Congratulations! Your score has been successfully added.');
      }
    });
    
  }

  return false;
}


function LoadTopPlayers() {
 $.ajax({
    url: '/scores',
    type: 'GET',
    error: AjaxError,
    success: function(result_content) {
    $('div#top_scores').html(result_content);
    }
  }); 
}


// START :-*
$(document).ready(function() {
  var timer;

  PreloadForm();

  LoadTopPlayers();
  setInterval(LoadTopPlayers, 5000);

  // Hide main game panel and results page at the start
  $('div#game_object').hide();
  $('div#result_page').hide();


  // Create main game panel
  InitPuzzle();

  // Attach click event to each square of the puzzle
  $('#board').children('div').on('click', function() {
    Move(this);

    // We want to check if puzzle was solved after every move
    if (Check()) {
      clearInterval(timer);
      alert("You solved it! Time spent: " + current_timer + " seconds.");

      $('input#score_time').val(current_timer);
      $('div#game_object').hide(1000);
      $('div#header').hide();
      $('div#top_scores').hide();
      $('div#result_page').show(1000);
    }
  });

  // If any of the pictures was clicked - use this picture as puzzle and start game
  $('img.pictures').on('click', function() {
    $('div#game_header').hide();

    // Get a description for the chosen picture
    var picinfo = $(this).data("answer");
    $("div#answer").html(picinfo);
    
    timer = setInterval(ShowTimer, 1000);

    pic_src = $(this).attr('src');

    // We want to attach chosen image to squares number 1-15 only (16th is an empty one)
    $('div#board').children('div:nth-child(-n+15)')
      .css('background-image', 'url(' + pic_src + ')');

    // Finally, show our puzzle to an user
    $('#game_object').fadeIn(500)

    // Shuffle our puzzle
    Shuffle();
  })

});


