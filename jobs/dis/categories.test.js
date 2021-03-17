const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const nock = require('nock');
const iconv = require('iconv-lite');

const populateCategories = require('./categories');
const db = require('../../models');

const fixturesPath = path.join(__dirname, 'fixtures', 'categories.html');
let fixtures;

beforeAll(async () => {
    if (!fs.existsSync(fixturesPath)) {
        const res = await fetch('https://online.dis.rs/proizvodi.php', {
            headers: {
                cookie:
                    'PHPSESSID=gleun9s4uvhql6urc8ogtsa1r0; privacy_policy=yes; b2c_brArtPoStr=24; b2c_sortArt=kategorijaPromet',
            },
        });

        const buffer = await res.buffer();
        const decoded = iconv.decode(buffer, 'win1250');
        const html = decoded.toString();
        fs.writeFileSync(fixturesPath, html);
        fixtures = html;
    } else {
        fixtures = fs.readFileSync(fixturesPath);
    }
    fixtures = iconv.encode(fixtures, 'win1250'); // We need to encode fixtures in both cases so we don't have issues with symbols
});

beforeEach(async () => {
    nock('https://online.dis.rs', {
        headers: {
            cookie:
                'PHPSESSID=gleun9s4uvhql6urc8ogtsa1r0; privacy_policy=yes; b2c_brArtPoStr=24; b2c_sortArt=kategorijaPromet',
        },
    })
        .persist()
        .get(`/proizvodi.php`)
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
        name: 'SOKOVI"',
        slug: 'sokovi"',
    });

    await populateCategories();

    const categories = await db.Category.findAll({
        where: {
            slug: 'sokovi"',
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
    expect(categories).toBe(158);
});

afterAll(() => db.sequelize.close());
