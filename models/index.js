const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
});

const db = {};

// Load all models
fs.readdirSync(__dirname).forEach((file) => {
    if (file === 'index.js') {
        return;
    }
    const modelPath = path.join(__dirname, file);
    // eslint-disable-next-line
    db[file.replace(/\.js$/, '')] = require(modelPath)(sequelize, Sequelize);
});

Object.keys(db).forEach((model) => {
    if (db[model].associate) {
        db[model].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.sync = async () => {
    if (process.env.NODE_ENV !== 'test') {
        return;
    }
    await db.sequelize.sync({ force: true });
};

module.exports = db;
