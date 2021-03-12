const api = require('../api');
const { Store } = require('../../models');

api.get('/stores', async (req, res) => {
    const stores = await Store.findAll();

    res.json({ stores });
});
