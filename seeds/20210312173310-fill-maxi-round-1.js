const populateCategories = require('../jobs/maxi/categories');
const populateProducts = require('../jobs/maxi/products');

module.exports = {
    run: async (db) => {
        const existing = await db.Category.findOne({
            where: {
                slug: 'maxi',
            },
        });

        if (!existing) {
            await db.Store.create({
                code: 'maxi',
                name: 'maxi',
            });
        }

        await populateCategories();
        await populateProducts();
    },
};
