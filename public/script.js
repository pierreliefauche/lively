(function(){
  var maxs,
      mins = [0, 50], // minimum position of tweets
      query = 'sunrise', // default query
      $window = $(window),
      $body = $('body'),
      $kit = $('.kit'),
      $input = $('input');

  // Compute max dimensions on window resize
  function resized() {
    maxs = [$window.width(), $window.height()];
  }
  $window.resize(resized);
  resized();

  // Will be called when a tweet is received
  var addTweet = function(username, text) {
    // Build DOM elements
    var $tweet = $('<article></article>')
      .append($('<p></p>').text(text))
      .append($('<h2></h2>').text('@'+username));

    // Insert at the end of the document
    $body.append($tweet);

    // On next tick (so the element is inserted in DOM and we can get its dimensions)
    setTimeout(function(){
      $tweet
        // Compute its random position
        .css({
          left: String(Math.floor(mins[0]+Math.random()*(maxs[0]-mins[0]-$tweet.outerWidth()))) + 'px',
          top : String(Math.floor(mins[1]+Math.random()*(maxs[1]-mins[1]-$tweet.outerHeight()))) + 'px'
        })
        // Begin animation
        .addClass('go');
    }, 0);

    // Remove the element from DOM after it disappeared
    setTimeout(function(){
      $tweet.remove();
    }, 10000);
  };


  // Socket.io

  var socket = io.connect();

  socket.on('connect', function(){
    socket.emit('start', query);
  });

  socket.on('tweet', function(tweet){
    addTweet(tweet.screen_name, tweet.text);
    $kit.removeClass('error');
  });

  socket.on('error', function(error){
    console.error(error);
    $kit.addClass('error');
  });

  // Form

  // Don't submit form, of course
  $('form').submit(function(event) {
    event.preventDefault();
  });

  // When input changes, change the search keyword
  $input.change(function(event) {
    var val = $input.blur().val();

    if (!val) {
      $input.val(query);
    } else if (val !== query) {
      query = val;
      socket.emit('start', query);
      $kit.addClass('error');
    }
  })
  .val(query);
})();
