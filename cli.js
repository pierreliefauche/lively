var lively = require('./lib/lively');

var printTweet = function(tweet) {
  console.log('\t@' + tweet.user.screen_name + '\n\t' + tweet.text.replace(/\s+/g, ' ') + '\n');
};

process.stdin.resume();
process.stdin.setEncoding('utf8');

var query;
process.stdin.on('data', function (text) {
  if (query) {
    // Detach current query
    lively.off(query, printTweet);
    console.log('Tired of "' + query + '"? I can understand.');
  }

  // Remove new line character
  query = text.replace('\n', '');

  // The "safe word" :)
  if (query === 'exit') {
    console.log('Bye');
    process.exit();
  }

  // Create and listen a new stream
  console.log('\nLet’s look for tweets matching "' + query + '"…');
  lively.on(query, printTweet, function(error) {
    query = null;
    console.error('Yikes! What just happened?!', error);
    console.error('Maybe try another query. "Bieber" or "Obama" are quite popular, but not as much "lol" or "wtf"…');
  });
});

console.log('Enter your query to get the tweets flowing. (type "exit" to… exit.)');

