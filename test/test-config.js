var test   = require('utest');
var assert = require('assert');

var lively = require('../lib/lively');
var defaultConfig = require('../lib/config');

test('default config', {
  'exists': function() {
    assert.ok(defaultConfig);
  },

  'is valid': function() {
    assert.ok(defaultConfig.consumerKey, 'consumer key is missing');
    assert.ok(defaultConfig.consumerSecret, 'consumer secret is missing');
    assert.ok(defaultConfig.accessToken, 'access token is missing');
    assert.ok(defaultConfig.accessTokenSecret, 'access token secret is missing');
  },
});


test('lively.config', {

  'has a default value': function() {
    assert.ok(lively.config);
  },

  'defaults to default config': function() {
    assert.deepEqual(lively.config, defaultConfig);
  },

  'has a valid default value': function() {
    assert.ok(
      lively.config &&
      lively.config.consumerKey &&
      lively.config.consumerSecret &&
      lively.config.accessToken &&
      lively.config.accessTokenSecret
    );
  },

  'cannot be set to anything else than an object': function() {
    lively.config = null;
    assert.notEqual(lively.config, null);

    lively.config = 'hello';
    assert.notEqual(lively.config, 'hello');

    lively.config = 42;
    assert.notEqual(lively.config, 42);

    lively.config = true;
    assert.notEqual(lively.config, true);
  },

  'cannot be set to an imcomplete config': function() {
    var newConfig = {};
    lively.config = newConfig;
    assert.deepEqual(lively.config, defaultConfig);

    newConfig.consumerKey = 'test';
    lively.config = newConfig;
    assert.deepEqual(lively.config, defaultConfig);

    newConfig.consumerSecret = 'test';
    lively.config = newConfig;
    assert.deepEqual(lively.config, defaultConfig);

    newConfig.accessToken = 'test';
    lively.config = newConfig;
    assert.deepEqual(lively.config, defaultConfig);

    newConfig.accessTokenSecret = 'test';
    delete newConfig.accessToken;
    lively.config = newConfig;
    assert.deepEqual(lively.config, defaultConfig);

    newConfig.accessToken = '';
    lively.config = newConfig;
    assert.deepEqual(lively.config, defaultConfig);
  },

  'can be set to a valid config': function() {
    var newConfig = {
      consumerKey: 'test',
      consumerSecret: 'test',
      accessToken: 'test',
      accessTokenSecret: 'test'
    };
    lively.config = newConfig;
    assert.deepEqual(lively.config, newConfig);
  },

});
