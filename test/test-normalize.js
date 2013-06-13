var test   = require('utest');
var assert = require('assert');

var normalizeTrack = require('../lib/normalizeTrack');

var giveAndGet = function(give, get) {
  return function() {
    assert.strictEqual(normalizeTrack(give), get);
  };
};

test('normalizeTrack', {

  'returns null for arrays': giveAndGet(['test', 42], null),

  'returns null for objects': giveAndGet({ test: 42 }, null),

  'returns null for null values': giveAndGet(null, null),

  'returns null for empty query': giveAndGet('   ,,    ,', null),

  'returns lowercase strings': giveAndGet('TeST', 'test'),

  'replaces all white spaces by single spaces': giveAndGet('a\tb  c', 'a b c'),

  'removes white spaces at the beginning': giveAndGet('    test', 'test'),

  'removes white spaces at the end': giveAndGet('test    ', 'test'),

  'removes useless commas': giveAndGet(',,,,a,,,b,,', 'a,b'),

  'removes useless commas AND spaces': giveAndGet(' ,, , ,a, , ,b , ,', 'a,b'),

  'removes multiple commas': giveAndGet('a,,,b', 'a,b'),

  'sorts phrases': giveAndGet('a,z,e,r,t,y,u,i,o,p', 'a,e,i,o,p,r,t,u,y,z'),

  'sorts keywords': giveAndGet('a z e r t y u i o p', 'a e i o p r t u y z'),

  'sorts keywords and phrases': giveAndGet('a c b,p c t,r b z', 'a b c,b r z,c p t'),

  'handles complex track': giveAndGet(', ,    ab\t gH)4 b"R  \t, test low  ,nature,,,   ', 'ab b"r gh)4,low test,nature')

});
