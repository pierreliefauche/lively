var test   = require('utest');
var assert = require('assert');

var lively = require('../lib/lively');

test('lively', {
  'returns null for invalid track queries': function() {
    assert.equal(null, lively(null));
    assert.equal(null, lively(''));
    assert.equal(null, lively(',,,,'));
  },

  'returns the same request object for the same track': function() {
    assert.strictEqual(lively('test'), lively('test'));
  },

  'returns different requests for different tracks': function() {
    assert.notStrictEqual(lively('test'), lively('test2'));
  },

  'returns the same request object for equivalent tracks': function() {
    assert.strictEqual(lively(',abc,test'), lively('test , abc'));
  },

});
