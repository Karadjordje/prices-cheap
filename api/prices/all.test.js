const supertest = require('supertest');
const app = require('../../test-utils/api');
const db = require('../../models');

require('./all');

beforeAll(async () => {
    await db.sequelize.sync({ force: true });
});

it('should return all prices', async () => {
    db.Price.bulkCreate([
        {
            value: 5,
            date: new Date(),
        },
        {
            value: 12,
            date: new Date(),
        },
        {
            value: 30,
            date: '2020-08-25',
        },
    ]);

    const res = await supertest(app).get('/prices').expect(200);

    expect(res.body.prices.length).toBe(3);
    expect(res.body.prices[1].value).toBe(12);
    expect(res.body.prices[2].date).toBe('2020-08-25');
});

afterAll(() => db.sequelize.close());
