// Dependencies
var OAuth = require('oauth').OAuth,
    normalizeTrack = require('./normalizeTrack');


// Load default Configuration
var config = require('./config');

module.exports = lively;

function lively(track, onTweet, onError) {
  var req = lively.getRequestForTrack(track);

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

// Getter and Setter to change the configuration
lively.__defineSetter__('config', function(newConfig){
  if (newConfig
    && typeof newConfig === 'object'
    && newConfig.consumerKey
    && newConfig.consumerSecret
    && newConfig.accessToken
    && newConfig.accessTokenSecret) {
    config = newConfig;
    oauthClient = null;
  } else {
    console.error('Configuration couldn’t be applied, it’s not complete.');
  }
});

lively.__defineGetter__('config', function(){
  return config;
});

// OAuth

var oauthClient;

lively.getOAuthClient = function() {
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
};

// Requests

lively.requests = {};

lively.getRequestForTrack = function(track) {
  // Normalize track
  if (!(track = normalizeTrack(track))) {
    return null;
  }

  if (!lively.requests[track]) {
    var request = createRawRequestForTrack(track);

    if (request) {
      // Set track on request
      request.track = track;

      // Cancel request if nobody listens for a tweet
      request.on('removeListener', function(){
        if (request.listeners('tweet').length === 0) {
          request.manuallyClosed = true;
          request.socket && request.socket.destroy();
          delete lively.requests[track];
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
      lively.requests[track] = request;
    }
  }

  return lively.requests[track];
};

var createRawRequestForTrack = function(track) {
  var request = lively.getOAuthClient().post(
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

      while ((index = data.indexOf('\r\n')) !== -1) {
        if (index > 0) {
          try {
            tweet = JSON.parse(data.substr(0, index));
          } catch(e) {
            console.error('ERROR PARSING JSON', e);
            break;
          }
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

  request.on('socket', function(socket) {
    request.socket = socket;
  });

  return request;
};
