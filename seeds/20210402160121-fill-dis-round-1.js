const populateCategories = require('../jobs/dis/categories');
const populateProducts = require('../jobs/dis/products');

module.exports = {
    run: async (db) => {
        const existing = await db.Store.findOne({
            where: {
                code: 'dis',
            },
        });

        if (!existing) {
            await db.Store.create({
                code: 'dis',
                name: 'Dis',
            });
        }

        await populateCategories();
        await populateProducts();
    },
};
