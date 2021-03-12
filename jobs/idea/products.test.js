const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const nock = require('nock');

const populateProducts = require('./products');
const db = require('../../models');

const bakeryCategoryId = '60007876';
const fixturesPath = path.join(__dirname, 'fixtures', 'products.json');
let fixtures;

beforeAll(async () => {
    // If products.json doesn't exist create it
    if (!fs.existsSync(fixturesPath)) {
        const data = await fetch(
            `https://online.idea.rs/v2/categories/${bakeryCategoryId}/products?per_page=48&page=1`,
        );
        const results = await data.json();
        const { products } = results;
        fixtures = products;
        fs.writeFileSync(fixturesPath, JSON.stringify(fixtures));
    } else {
        fixtures = JSON.parse(fs.readFileSync(fixturesPath));
    }
});

beforeEach(async () => {
    nock('https://online.idea.rs')
        .persist()
        .get(`/v2/categories/${bakeryCategoryId}/products?per_page=48&page=1`)
        .reply(200, { products: fixtures, _page: { page_count: 1 } });

    await db.sync({ force: true });
    await db.Store.create({
        code: 'idea',
        name: 'Idea',
    });
    await db.Category.create({
        name: 'pecivo',
        slug: 'pecivo',
        references: {
            idea: bakeryCategoryId,
        },
    });
});

it('should insert all products available on page', async () => {
    await populateProducts();
    const products = await db.Product.count();

    expect(products).toBe(fixtures.length);
});

it('should not insert duplicate product', async () => {
    await db.Product.create({
        name: 'K plus prezle 250g',
        slug: 'k-plus-prezle-250g',
        description: 'Some not important description',
        image:
            'https://online.idea.rs/images/products/300/300105723_1.jpg?1508483450',
        references: {
            idea: 60068714,
        },
    });

    await populateProducts();

    const products = await db.Product.findAll({
        where: {
            slug: 'k-plus-prezle-250g',
        },
    });

    expect(products.length).toBe(1);
});

it('should not insert duplicate products', async () => {
    await populateProducts();
    await populateProducts();
    await populateProducts();
    await populateProducts();

    const products = await db.Product.count();

    expect(products).toBe(fixtures.length);
});

afterAll(() => db.sequelize.close());
