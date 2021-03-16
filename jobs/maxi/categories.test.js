const fs = require('fs');
const path = require('path');
const nock = require('nock');

const populateCategories = require('./categories');
const db = require('../../models');

const fixturesPath = path.join(__dirname, 'fixtures', 'categories.json');
const fixtures = JSON.parse(fs.readFileSync(fixturesPath));

beforeEach(async () => {
    for (let i = 0; i < 100; i++) {
        nock('https://www.maxi.rs')
            .persist()
            .get(
                `/online/c/${(i + 1)
                    .toString()
                    .padStart(
                        2,
                        '0',
                    )}/loadMore?pageSize=200&pageNumber=0&sort=relevance`,
            )
            .reply(fixtures[i] ? 200 : 404, fixtures[i]);
    }

    await db.sequelize.sync({ force: true });
});

it('should insert all categories', async () => {
    await populateCategories();
    const categories = await db.Category.findAll();

    expect(categories.length).toBeGreaterThan(0);
});

it('should not insert duplicate category', async () => {
    await db.Category.create({
        name: 'Voće i povrće"',
        slug: 'voće-i-povrće"',
    });

    await populateCategories();

    const categories = await db.Category.findAll({
        where: {
            slug: 'voće-i-povrće"',
        },
    });

    expect(categories.length).toBe(1);
});

it.only('should not insert duplicate categories', async () => {
    await populateCategories();
    await populateCategories();
    await populateCategories();
    await populateCategories();
    await populateCategories();
    await populateCategories();

    const categories = await db.Category.count();
    expect(categories).toBe(fixtures.length);
});

afterAll(() => db.sequelize.close());
