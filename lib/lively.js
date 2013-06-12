// Dependencies
var util         = require('util'),
    EventEmitter = require('events').EventEmitter,
    OAuth        = require('oauth').OAuth;

var livelies = {};

module.exports = function(query) {
  if (!livelies[query]) {
    var instance = new Lively(query)
    instance.on('removeListener', function(){
      if (instance.listeners('tweet').length  === 0) {
        instance.stop();
        delete livelies[query];
      }
    });

    livelies[query] = instance.start();
  }

  return livelies[query];
};

module.exports.Lively = Lively;

module.exports.on = function(query, callback){
  module.exports(query).on('tweet', callback);
};

module.exports.off = function(query, callback){
  module.exports(query).removeListener('tweet', callback);
};

function Lively(query) {
  EventEmitter.call(this);

  this.query = query;

  this.oauth = new OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    'Kjf8J0wZUS7czP7HEB98w', // Consumer key
    'Goi4uEPkUkqQAhuFH99cMsmcVXybDUYwWPM55qqr19I', // Consumer Secret
    '1.0', null, 'HMAC-SHA1', null, {
      'Connection': 'keep-alive',
      'User-Agent': 'Lively Twitter Streaming Client'
  });
}

util.inherits(Lively, EventEmitter);

Lively.prototype.buildRequest = function() {
  return this.oauth.post(
    'https://stream.twitter.com/1.1/statuses/filter.json',
    '202845105-f7tvcL8ibhirqyAjLzyqLlNmUCRaCb0KjNotruSj',
    '2fjOjRVQWddIMtsBD6FZ61bvi1wLPAeLFuvalsMyWU',
    { track: this.query });
};

Lively.prototype.start = function() {
  this.running = true;
  if (this.request) return this;

  var self = this,
      request = this.buildRequest(this.query);

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
            self.emit('tweet', tweet, self);
          }
        } catch(e) {
          console.log('ERROR PARSING JSON', e);
          break;
        }
      }
    });

    response.on('end', function(chunk){
      if (self.running) {
        self.reset();
      }
    });
  });

  request.on('error', function(){
    self.reset();
  });

  request.end();

  this.request = request;

  return this;
};

Lively.prototype.stop = function() {
  this.running = false;
  if (this.request && this.request.res && this.request.res.socket) {
    this.request.res.socket.destroy();
  }
  this.request = null;
  return this;
};

Lively.prototype.reset = function() {
  return this.stop().start();
};
