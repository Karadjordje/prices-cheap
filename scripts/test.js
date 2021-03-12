process.env.NODE_ENV = 'test';
require('dotenv').config({
    path: '.test.env',
});

const jest = require('jest');

const argv = process.argv.slice(2);

argv.push('--runInBand');

if (!process.env.CI) {
    argv.push('--watchAll');
}

jest.run(argv);
