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
        references: {
            idea: 60007876,
        },
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

    /* eslint-disable no-param-reassign */
    const totalCategories = fixtures.reduce((acc, current) => {
        if (current.children && current.children.length > 0) {
            acc += current.children.length;
        }
        return acc;
    }, fixtures.length);
    /* eslint-enable no-param-reassign */

    expect(categories).toBe(totalCategories);
});

afterAll(() => db.sequelize.close());
