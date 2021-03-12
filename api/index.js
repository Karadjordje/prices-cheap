const requireDir = require('require-dir');
const api = require('./api');

requireDir(__dirname, {
    recurse: true,
    filter(fullPath) {
        return !fullPath.match(/\.test\.js$/);
    },
});

module.exports = api;
