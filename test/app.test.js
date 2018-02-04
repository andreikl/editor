const assert = require('assert');

const app = require('../app');

describe('App', function() {
    it('should exist', function() {
        const expected = 'function';
        const actual = typeof app;

        assert.equal(actual, expected);
    });
});