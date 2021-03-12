const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const nock = require('nock');

const populateProducts = require('./products');
const db = require('../../models');

const drinksCategoryId = '01';
const fixturesPath = path.join(__dirname, 'fixtures', 'products.json');
let fixtures;

beforeAll(async () => {
    // If products.json doesn't exist create it
    if (!fs.existsSync(fixturesPath)) {
        const data = await fetch(
            `https://www.maxi.rs/online/c/${drinksCategoryId}/loadMore?pageSize=200&pageNumber=0&sort=relevance`,
        );
        const results = await data.json();
        const { results: products } = results;
        fixtures = products;
        fs.writeFileSync(fixturesPath, JSON.stringify(products));
    } else {
        fixtures = JSON.parse(fs.readFileSync(fixturesPath));
    }
});

beforeEach(async () => {
    nock('https://www.maxi.rs')
        .persist()
        .get(
            `/online/c/${drinksCategoryId}/loadMore?pageSize=200&pageNumber=0&sort=relevance`,
        )
        .reply(200, { results: fixtures, pagination: { page_count: 1 } });

    await db.sync({ force: true });
    await db.Store.create({
        code: 'maxi',
        name: 'Maxi',
    });
    await db.Category.create({
        name: 'Piće, kafa i čaj',
        slug: 'piće-kafa-i-čaj',
        references: {
            maxi: drinksCategoryId,
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
        name: 'Mineralna voda NG Rosa 1,5l',
        slug: 'mineralna-voda-ng-rosa-15l',
        description: 'Some not important description',
        image:
            'https://d3el976p2k4mvu.cloudfront.net//medias/sys_master/h03/h0a/8844326895646.png',
        references: {
            maxi: 7175835,
        },
    });

    await populateProducts();

    const products = await db.Product.findAll({
        where: {
            slug: 'mineralna-voda-ng-rosa-15l',
        },
    });

    expect(products.length).toBe(1);
});

it('should not insert duplicate products', async () => {
    await populateProducts();
    await populateProducts();

    const products = await db.Product.count();

    expect(products).toBe(fixtures.length);
});

afterAll(() => db.sequelize.close());
