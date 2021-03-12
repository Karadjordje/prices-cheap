const populateCategories = require('../jobs/idea/categories');
const populateProducts = require('../jobs/idea/products');

module.exports = {
    run: async (db) => {
        await db.Store.create({
            code: 'idea',
            name: 'Idea',
        });
        await populateCategories();
        await populateProducts();
    },
};
