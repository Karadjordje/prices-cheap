const supertest = require('supertest');
const app = require('../../test-utils/api');
const db = require('../../models');

require('./all');

beforeAll(async () => {
    await db.sequelize.sync({ force: true });
});

it('should return all stores', async () => {
    await db.Store.bulkCreate([
        {
            code: 'idea',
            name: 'Idea',
        },
        {
            code: 'dis',
            name: 'Dis',
        },
    ]);

    const res = await supertest(app).get('/stores').expect(200);

    expect(res.body.stores.length).toBe(2);
});

afterAll(() => db.sequelize.close());
