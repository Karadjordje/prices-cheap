const populateCategories = require('../jobs/maxi/categories');
const populateProducts = require('../jobs/maxi/products');

module.exports = {
    run: async (db) => {
        const existing = await db.Store.findOne({
            where: {
                code: 'maxi',
            },
        });

        if (!existing) {
            await db.Store.create({
                code: 'maxi',
                name: 'Maxi',
            });
        }

        await populateCategories();
        await populateProducts();
    },
};
