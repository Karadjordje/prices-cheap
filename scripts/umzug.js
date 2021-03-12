/* eslint-disable no-console */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
require('dotenv').config({ silent: true });

const Sequelize = require('sequelize');
const path = require('path');
const Umzug = require('umzug');
const minimist = require('minimist');
const db = require('../models');

const run = async () => {
    const { type = 'migrations', pending = false, _ } = minimist(
        process.argv.slice(2),
    );
    const umzug = new Umzug({
        storage: 'sequelize',
        storageOptions: {
            sequelize: db.sequelize,
            modelName: 'sequelize_meta',
        },
        upName: 'run',
        migrations: {
            // The params that gets passed to the migrations.
            // Might be an array or a synchronous function which returns an array.
            params:
                type === 'migrations'
                    ? [db.sequelize.getQueryInterface(), Sequelize, db]
                    : [db],

            // The path to the migrations directory.
            path: path.join(__dirname, '..', type),

            // The pattern that determines whether or not a file is a migration or seed.
            pattern: /^\d+[\w-]+\.js$/,

            // A function that receives and returns the to be executed function.
            // This can be used to modify the function.
            wrap: (fun) => fun,
        },
    });

    let files = await umzug.pending();
    files = files.map((f) => f.file);
    if (_ && _.length > 0) {
        files = files.filter((file) => _.find((f) => file.indexOf(f) !== -1));
    }

    console.log(`Pending ${type}:`);
    console.log(files);
    if (!pending) {
        const results = await umzug.up(files);
        console.log(`Sucessful ${type}:`);
        console.log(results.map((f) => f.file));
    }
};

run()
    .then(() => {
        process.exit();
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
