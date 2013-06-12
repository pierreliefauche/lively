// Dependencies
var OAuth = require('oauth').OAuth;

module.exports = lively;

function lively(query, onTweet, onError) {
  var req = lively.getRequestForQuery(query);

  if (req && onTweet) {
    req.on('tweet', onTweet);
    req.on('error', function(){
      onError && onError.apply(this, arguments);
      req.removeListener('tweet', onTweet);
    });
  } else if (onError) {
    onError('Couldn’t create request');
  }

  return req;
};

lively.requests = {};

lively.getRequestForQuery = function(query) {
  if (!lively.requests[query]) {
    var request = lively.createRawRequestForQuery(query);

    if (request) {
      // Cancel request if nobody listens for a tweet
      request.on('removeListener', function(){
        if (request.listeners('tweet').length === 0) {
          request.manuallyClosed = true;
          request.socket && request.socket.destroy();
          delete lively.requests[query];
        }
      });

      // Request is started only once someone listens for a tweet
      var callback = function(){
        if (request.listeners('tweet').length > 0) {
          request.removeListener('newListener', callback);
          request.end();
        }
      };
      request.on('newListener', callback);

      // Remember request
      lively.requests[query] = request;
    }
  }

  return lively.requests[query];
};

lively.createRawRequestForQuery = function(query) {
  var oauth = new OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    'Kjf8J0wZUS7czP7HEB98w', // Consumer key
    'Goi4uEPkUkqQAhuFH99cMsmcVXybDUYwWPM55qqr19I', // Consumer Secret
    '1.0', null, 'HMAC-SHA1', null, {
      'Connection': 'keep-alive',
      'User-Agent': 'Lively Twitter Streaming Client'
  });

  var request = oauth.post(
    'https://stream.twitter.com/1.1/statuses/filter.json',
    '202845105-f7tvcL8ibhirqyAjLzyqLlNmUCRaCb0KjNotruSj',
    '2fjOjRVQWddIMtsBD6FZ61bvi1wLPAeLFuvalsMyWU',
    { track: query });

  request.on('response', function(response){
    response.setEncoding('utf8');

    var data = '',
        index,
        tweet;

    response.on('data', function(chunk){
      data += chunk;

      while ((index = data.indexOf('\r\n')) !== -1) {
        try {
          tweet = JSON.parse(data.substr(0, index));
          data = data.substr(index+2);
          if (tweet.text) {
            request.emit('tweet', tweet);
          }
        } catch(e) {
          console.log('ERROR PARSING JSON', e);
          break;
        }
      }
    });

    response.on('end', function(){
      if (!request.manuallyClosed) {
        request.emit('error', 'Twitter closed connection');
      }
    });
  });

  request.on('socket', function(socket) {
    request.socket = socket;
  });

  return request;
};
