require('dotenv').config();

console.log(process.env);
const models = require('./models');

const test = async () => {
    await models.sequelize.sync({ force: true });

    const category = await models.Category.create({
        name: 'Slatkisi',
        slug: 'slatkisi',
    });

    const coko = await models.Product.create({
        name: 'Coko Bananica',
        slug: 'coko-bananica',
        categoryId: category.id,
    });

    const store = await models.Store.create({
        code: 'idea',
        name: 'Idea',
    });

    await models.Price.create({
        storeId: store.id,
        productId: coko.id,
        value: 10,
        date: new Date(),
    });

    const products = await models.Product.findAll({
        // where: {
        // name: 'Coko'
        // },
        include: [
            {
                model: models.Store,
                through: models.Price,
            },
        ],
    });
    console.log('\n\n\n\n');
    console.log(JSON.stringify(products, null, 2));
};

test();
