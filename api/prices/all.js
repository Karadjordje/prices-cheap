const api = require('../api');
const { Price } = require('../../models');

api.get('/prices', async (req, res) => {
    const prices = await Price.findAll();

    res.json({ prices });
});
