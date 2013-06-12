var lively = require('./lib/lively');

var count = 5;

var callback = function(tweet) {
  console.log('----->', tweet.text);

  if (!--count) {
    lively.off('obama', callback);
  }
};

var l = lively.on('obama', callback);


