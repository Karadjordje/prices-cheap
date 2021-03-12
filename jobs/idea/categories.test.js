const fs = require('fs');
const path = require('path');
const nock = require('nock');
const populateCategories = require('./categories');
const db = require('../../models');

const fixturesPath = path.join(__dirname, 'fixtures', 'categories.json');
const fixtures = JSON.parse(fs.readFileSync(fixturesPath));

beforeEach(async () => {
    nock('https://online.idea.rs')
        .persist()
        .get('/v2/categories')
        .reply(200, fixtures);
    await db.sequelize.sync({ force: true });
});

it('should insert all categories', async () => {
    await populateCategories();
    const categories = await db.Category.findAll();

    expect(categories.length).toBeGreaterThan(0);
});

it('should not insert duplicate category', async () => {
    await db.Category.create({
        name: 'Pekara',
        description: 'Jer to je pekara by top 011',
        slug: 'pekara',
    });

    await populateCategories();

    const categories = await db.Category.findAll({
        where: {
            slug: 'pekara',
        },
    });

    expect(categories.length).toBe(1);
});

it('should not insert duplicate categories', async () => {
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
