var assert = require('assert');
var httpception = require('httpception');
var got = require('got');

var notIt = require('../lib/notIt');

describe('not-it', function () {
    it('queued httpception', function () {
        httpception({
            request: 'GET http://example.com/foobar',
            response: {
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: 'the text'
            }
        });

        httpception({
            request: 'GET http://example.com/foobaz',
            response: {
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: 'the text'
            }
        });

        return got('example.com/foobar')
            .then(() => {
                return got('example.com/foobaz')
            })
            .then(response => {
                assert.equal(response.body, 'the text');
            });
    });

    it('should perform the right HTTP request', () => httpception({
        request: 'GET /foobar',
        response: {
            statusCode: 200,
            body: 'the text'
        }
    }, () => {
        return got('example.com/foobar')
            .then(response => {
                assert.equal(response.body, 'the text');
            });
    }));

    describe('when locally wrapping', function () {
        notIt(it)('should run a test block', function () {
            afterEach(function () {
                return Promise.resolve('LOCALLY');
            });
        });

        notIt(it, 'should run a test block', function () {
            afterEach(function () {
                return Promise.resolve('LOCALLY');
            });
        });
    });

    describe('when globally wrapping', function () {
        var it = notIt(global.it);

        it('should run a test block', function () {
            afterEach(function () {
                return Promise.resolve('GLOBALLY');
            });
        });

        it('should perform the right HTTP request', () => {
            httpception({
                request: 'GET /foobar',
                response: {
                    statusCode: 200,
                    body: 'the text'
                }
            });

            return got('example.com/foobar')
                .then(response => {
                    assert.equal(response.body, 'the text');
                });
        });

        it('queued httpception', function () {
            httpception({
                request: 'GET http://example.com/foobar',
                response: {
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    body: 'the text'
                }
            });

            httpception({
                request: 'GET http://example.com/foobaz',
                response: {
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    body: 'the text'
                }
            });

            return got('example.com/foobar')
                .then(() => {
                    return got('example.com/foobaz')
                })
                .then(response => {
                    assert.equal(response.body, 'the text');
                });
        });
    });
});
