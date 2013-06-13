var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var lively = require('./lib/lively');

app.listen(process.env.PORT || 8080);

function handler (req, res) {
  fs.readFile(__dirname + '/public/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  var track;

  var onTweet = function(tweet) {
    socket.emit('tweet', {
      screen_name: tweet.user.screen_name,
      text: tweet.text
    });
  };

  var onError = function(err) {
    socket.emit('error', err);
  };

  var detach = function() {
    lively.off(track, onTweet, onError);
    track = null;
  }

  socket.on('start', function(newTrack){
    detach();
    track = newTrack;
    lively.on(track, onTweet, onError);
  });

  socket.on('stop', detach);
  socket.on('disconnect', detach);
});
