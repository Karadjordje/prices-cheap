const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const nock = require('nock');

const populateCategories = require('./categories');
const db = require('../../models');

const fixturesPath = path.join(__dirname, 'fixtures', 'categories.html');
let fixtures;

beforeAll(async () => {
    if (!fs.existsSync(fixturesPath)) {
        const res = await fetch('https://www.maxi.rs/online');

        const body = await res.text();
        fs.writeFileSync(fixturesPath, body);
        fixtures = body;
    } else {
        fixtures = fs.readFileSync(fixturesPath);
    }
});

beforeEach(async () => {
    nock('https://www.maxi.rs').persist().get(`/online`).reply(200, fixtures);

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

it('should not insert duplicate categories', async () => {
    await populateCategories();
    await populateCategories();
    await populateCategories();
    await populateCategories();
    await populateCategories();
    await populateCategories();

    const categories = await db.Category.count();
    expect(categories).toBe(683);
});

afterAll(() => db.sequelize.close());
