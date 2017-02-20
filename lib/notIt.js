var Promise = require('bluebird');

function executeIt(globalIt, testDescription, testBlock) {
    globalIt(testDescription, function () {
        return executeWithinIt(testBlock);
    });
}

function executeWithinIt(testBlock) {
    var cleanupBlocks = [];

    function __registerAfter(block) {
        cleanupBlocks.push(function () {
            return handleBlock(block);
        });
    }

    global.__registerAfter = __registerAfter;

    __registerAfter(function () {
        return Promise.try(function () {
            delete global.__registerAfter;
        });
    });

    return promiseWrapper(testBlock, cleanupBlocks);
}

function handleBlock(block) {
    if (block.length > 0) {
        return Promise.fromCallback(block);
    } else {
        return block();
    }
}

function promiseWrapper(testBlock, testCleanups) {
     return Promise.try(function () {
        return handleBlock(testBlock);
    }).finally(function () {
        return new Promise(function (resolve, reject) {
            (function processBlocks(inputBlocks) {
                var currentBlock = inputBlocks.shift();
                if (!currentBlock) {
                    resolve();
                }

                return currentBlock().then(function () {
                    return processBlocks(inputBlocks);
                }).catch(reject);
            })(testCleanups.slice(0));
        });
    });
}

module.exports = function () {
    var argumentsArray = Array.prototype.slice.call(arguments);
    var numberOfArguments = argumentsArray.length;
    var globalIt = argumentsArray[0];

    if (numberOfArguments === 3) {
        var testDescription = argumentsArray[1];
        var testBlock = argumentsArray[2];

        // direct invocation
        return executeIt(globalIt, testDescription, testBlock);
    } if (numberOfArguments === 1) {
        // wrapping invocation
        return executeIt.bind(null, globalIt);
    } else {
        throw new Error('Cannot be used without supplying "it".');
    }
};
