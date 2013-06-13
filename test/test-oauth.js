var test   = require('utest');
var assert = require('assert');

var lively = require('../lib/lively');

test('lively.oauth', {
  'exists': function() {
    assert.ok(lively.oauth);
  },

  'is the same object between calls to the getter': function() {
    assert.strictEqual(lively.oauth, lively.oauth);
  },

  'is NOT modified when trying to set an invalid config': function() {
    var defaultOAuth = lively.oauth;
    lively.config = null;
    assert.strictEqual(lively.oauth, defaultOAuth);
  },

  'is modified when a new config is passed': function() {
    var defaultOAuth = lively.oauth;
    lively.config = {
      consumerKey: 'test',
      consumerSecret: 'test',
      accessToken: 'test',
      accessTokenSecret: 'test'
    };
    assert.ok(lively.oauth);
    assert.notStrictEqual(lively.oauth, defaultOAuth);
  },

});
