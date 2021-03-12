const fs = require('fs');
const minimist = require('minimist');
const path = require('path');
const format = require('date-fns/format');

const now = format(new Date(), 'yyyyMMddHHmmss');
const { type = 'migrations', _ } = minimist(process.argv.slice(2));

const fileName = `${now}-${
    _.length > 0 ? _.map((f) => f.toLowerCase()).join('-') : 'unamed-change'
}.js`;
const fullPath = path.join(__dirname, '..', type, fileName);

const template = `module.exports = {
    run: async (${type === 'migrations' ? 'migration, Sequelize, ' : ''}db) => {
        /*
            Add altering commands here.
            Return a promise to correctly handle asynchronicity.
            Example:
            await migration.createTable('users', { id: Sequelize.INTEGER });
        */
    },
};`;

fs.writeFileSync(fullPath, template, 'utf-8');
// eslint-disable-next-line no-console
console.log(`Sucessfuly created ${type} ${fileName}`);
