var lively = require('./lib/lively');

var printTweet = function(tweet) {
  console.log('\t@' + tweet.user.screen_name + '\n\t' + tweet.text.replace(/\s+/g, ' ') + '\n');
};

process.stdin.resume();
process.stdin.setEncoding('utf8');

var query;
process.stdin.on('data', function (text) {
  if (query) {
    lively.off(query, printTweet);
    console.log('Tired of "' + query + '"? I can understand.');
  }

  query = text.replace('\n', '');

  if (query === 'exit') {
    console.log('Bye');
    process.exit();
  }

  console.log('\nLet’s look for tweets matching "' + query + '"…');
  lively.on(query, printTweet, function(error) {
    console.error('Yikes! What just happened?!', error);
  });
});

console.log('Enter your query to get the tweets flowing. (type "exit" to… exit.)');

