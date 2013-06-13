// Dependencies
var OAuth = require('oauth').OAuth;
var normalizeTrack = require('./normalizeTrack');

// Export is a simple function that returns a request for the provided track
var lively = module.exports = function(track) {
  return getRequestForTrack(track);
};


// Load default Configuration
var config = require('./config');
// oauth client used to build requests
var oauthClient;
// store requests by track to re-use them if necessary
var requests = {};


// Convenience methods

// Attach callbacks to 'tweet' and 'error' events of a request
lively.on = function(track, onTweet, onError) {
  var req = getRequestForTrack(track);

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

// Detach callbacks from 'tweet' and 'error' events of a request
lively.off = function(track, onTweet, onError) {
  var req = getRequestForTrack(track, true);
  if (req) {
    onError && req.removeListener('error', onError);
    onTweet && req.removeListener('tweet', onTweet);
  }
};


// Getters and setters

// Get internal oauth configuration
lively.__defineGetter__('config', function(){
  return config;
});

// Change internal oauth configuration to a new _valid_ config
// If configuration is successfully changed, current oauth client
// is discared so a new one will be created next time it’s needed
lively.__defineSetter__('config', function(newConfig){
  if (newConfig
    && typeof newConfig === 'object'
    && newConfig.consumerKey
    && newConfig.consumerSecret
    && newConfig.accessToken
    && newConfig.accessTokenSecret)
  {
    config = newConfig;
    oauthClient = null;
  } else {
    console.error('Configuration couldn’t be applied, it’s not complete.');
  }
});

// Getter for the oauth client
// Creates it on-the-fly if needed
lively.__defineGetter__('oauth', function(){
  if (!oauthClient) {
    oauthClient = new OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      config.consumerKey,
      config.consumerSecret,
      '1.0', null, 'HMAC-SHA1', null, {
        'Connection': 'keep-alive',
        'User-Agent': 'Lively Twitter Streaming Client'
    });
  }

  return oauthClient;
});


// Requests

// Returns a request for a valid track query.
// Does not create new requests for existing queries.
// Destroys requests when there's no listener on the 'tweet' event.
var getRequestForTrack = function(track, dontCreate) {
  // Normalize track
  if (!(track = normalizeTrack(track))) {
    return null;
  }

  if (!requests[track] && !dontCreate) {
    var request = createRawRequestForTrack(track);

    if (request) {
      // Set track on request to access it elsewhere
      request.track = track;

      // Cancel request if nobody listens for a tweet
      request.on('removeListener', function(){
        process.nextTick(function(){
          if (request.listeners('tweet').length === 0) {
            request.manuallyClosed = true;
            request.socket && request.socket.destroy();
            delete requests[track];
          }
        });
      });

      // Request is started only once someone listens for a tweet
      var callback = function(){
        if (request.listeners('tweet').length > 0) {
          request.removeListener('newListener', callback);
          request.end();
        }
      };
      request.on('newListener', callback);

      // Store request
      requests[track] = request;
    }
  }

  return requests[track];
};

// Create request objects to Twitter Streaming API
// Handles JSON parsing and 'tweet' event emission
var createRawRequestForTrack = function(track) {
  var request = lively.oauth.post(
    'https://stream.twitter.com/1.1/statuses/filter.json',
    config.accessToken,
    config.accessTokenSecret,
    { track: track }
  );

  request.on('response', function(response){
    response.setEncoding('utf8');

    if (response.statusCode !== 200) {
      request.emit('error', 'HTTP Error: ' + response.statusCode);
      return;
    }

    var data = '',
        index,
        tweet;

    response.on('data', function(chunk){
      data += chunk;

      // Tweets (or other entities) are delimited by "\r\n"
      while ((index = data.indexOf('\r\n')) !== -1) {
        if (index > 0) {
          try {
            tweet = JSON.parse(data.substr(0, index));
          } catch(e) {
            console.error('ERROR PARSING JSON', e);
            break;
          }
          // Check if the parsed data is a tweet (it should have a "text")
          if (tweet && tweet.text) {
            request.emit('tweet', tweet);
          }
        }
        data = data.substr(index+2);
      }
    });

    response.on('end', function(){
      if (!request.manuallyClosed) {
        request.emit('error', 'Twitter closed connection');
      }
    });
  });

  // Quick access to socket object to be able to close it later
  request.on('socket', function(socket) {
    request.socket = socket;
  });

  return request;
};
