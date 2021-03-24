const supertest = require('supertest');
const app = require('../../test-utils/api');
const db = require('../../models');

require('./all');

beforeAll(async () => {
    await db.sequelize.sync({ force: true });
});

it('should return products', async () => {
    const category = await db.Category.create({
        name: 'Slatkisi',
        slug: 'slatkisi',
    });

    const coko = await db.Product.create({
        name: 'Coko Bananica',
        slug: 'coko-bananica',
        categoryId: category.id,
    });

    const store = await db.Store.create({
        code: 'idea',
        name: 'Idea',
    });

    await db.Price.create({
        storeId: store.id,
        reducedPrice: false,
        productId: coko.id,
        value: 10,
        date: new Date(),
    });

    const products = await db.Product.findAll({
        include: [
            {
                model: db.Store,
                through: db.Price,
            },
        ],
    });

    const res = await supertest(app).get('/products').expect(200);

    expect(res.body.products.length).toBe(1);
    expect(res.body.products.length).toBe(products.length);
    expect(res.body.products[0].name).toBe('Coko Bananica');
});

afterAll(() => db.sequelize.close());
