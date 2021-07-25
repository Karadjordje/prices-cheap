const populateCategories = require('../jobs/idea/categories');
const populateProducts = require('../jobs/idea/products');

module.exports = {
    run: async (db) => {
        const existing = await db.Store.findOne({
            where: {
                code: 'idea',
            },
        });

        if (!existing) {
            await db.Store.create({
                code: 'idea',
                name: 'Idea',
            });
        }

        await populateCategories();
        await populateProducts();
    },
};
