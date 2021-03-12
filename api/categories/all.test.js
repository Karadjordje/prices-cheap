const supertest = require('supertest');
const app = require('../../test-utils/api');
const db = require('../../models');

require('./all');

beforeAll(async () => {
    await db.sequelize.sync({ force: true });
});

it('should return all categories', async () => {
    await db.Category.bulkCreate([
        {
            name: 'Slatkisi',
            description:
                'Proizvodi koji sadrze mnogo secera i strava su zdravi',
            slug: 'slatkisi',
        },
        {
            name: 'Meso',
            description: 'Proizvodi za prave ljude',
            slug: 'meso',
        },
    ]);

    const res = await supertest(app).get('/categories').expect(200);

    expect(res.body.categories.length).toBe(2);
    expect(res.body.categories[0].name).toBe('Slatkisi');
});

afterAll(() => db.sequelize.close());
