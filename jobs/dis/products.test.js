const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const nock = require('nock');
const iconv = require('iconv-lite');

const populateProducts = require('./products');
const db = require('../../models');

jest.mock('./get-session-id', () => () =>
    Promise.resolve('qnchtfaf3672n12dkakceipfq2'),
);

const noResultsFixture = path.join(__dirname, 'fixtures', 'no-results.html');
const noResults = fs.readFileSync(noResultsFixture);
const fixturesPath = path.join(__dirname, 'fixtures', 'products.html');
let fixtures;
const alcoholCategoryId = 'P1';

beforeAll(async () => {
    if (!fs.existsSync(fixturesPath)) {
        const res = await fetch(
            `https://online.dis.rs/proizvodi.php?limit=0&kat=${alcoholCategoryId}`,
            {
                headers: {
                    cookie:
                        'privacy_policy=yes; PHPSESSID=qnchtfaf3672n12dkakceipfq2; b2c_sortArt=kategorijaPromet; b2c_brArtPoStr=96',
                },
            },
        );

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

let store;

beforeEach(async () => {
    nock('https://online.dis.rs', {
        headers: {
            cookie:
                'privacy_policy=yes; PHPSESSID=qnchtfaf3672n12dkakceipfq2; b2c_sortArt=kategorijaPromet; b2c_brArtPoStr=96',
        },
    })
        .persist()
        .get(`/proizvodi.php?limit=0&kat=${alcoholCategoryId}`)
        .reply(200, fixtures);

    nock('https://online.dis.rs', {
        headers: {
            cookie:
                'privacy_policy=yes; PHPSESSID=qnchtfaf3672n12dkakceipfq2; b2c_sortArt=kategorijaPromet; b2c_brArtPoStr=96',
        },
    })
        .persist()
        .get(`/proizvodi.php?limit=96&kat=${alcoholCategoryId}`)
        .reply(200, noResults);

    await db.sequelize.sync({ force: true });

    store = await db.Store.create({
        code: 'dis',
        name: 'Dis',
    });
    await db.Category.create({
        name: 'BEZALKOHOLNA PIĆA',
        slug: 'bezalkoholna-pica',
        references: {
            dis: alcoholCategoryId,
        },
    });
});

it('should insert all products available on page', async () => {
    await populateProducts();
    const products = await db.Product.count();

    expect(products).toBe(96);
});

it('should not insert duplicate product', async () => {
    await db.Product.create({
        name: 'Guinness pivo tamno limenka 440 ml',
        slug: 'guinness-pivo-tamno-limenka-440-ml',
        image: 'http://cdn.dis.rs/shared/images/articles/329000/329199.jpg',
        references: {
            dis: 329199,
        },
    });

    await populateProducts();

    const products = await db.Product.findAll({
        where: {
            slug: 'guinness-pivo-tamno-limenka-440-ml',
        },
    });

    expect(products.length).toBe(1);
});

it('should not insert duplicate products', async () => {
    await populateProducts();
    await populateProducts();

    const products = await db.Product.count();

    expect(products).toBe(96);
});

it('should have price on all products', async () => {
    await populateProducts();

    const products = await db.Product.findAll({
        include: [
            {
                model: db.Price,
                where: {
                    storeId: store.id,
                },
            },
        ],
    });

    products.map((product) => {
        expect(product.prices[0].value).toBeDefined();
        expect(product.prices[0].value).toBeGreaterThan(0);
    });
});

afterAll(() => db.sequelize.close());
