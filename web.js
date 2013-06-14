var app = require('http').createServer(server);
var io = require('socket.io').listen(app);
var fs = require('fs');

var lively = require('./lib/lively');

app.listen(process.env.PORT || 8080);

function server(req, res) {
  var filePath = req.url;

  // Basic security check
  if (filePath.indexOf('..') !== -1) {
    res.writeHead(404);
    return res.end('Invalid URL');
  }

  if (filePath === '/') {
    filePath += 'index.html';
  }

  fs.readFile(__dirname + '/public' + filePath,
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading file at path '+ filePath);
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
