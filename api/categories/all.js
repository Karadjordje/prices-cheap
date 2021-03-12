const api = require('../api');
const { Category } = require('../../models');

api.get('/categories', async (req, res) => {
    const categories = await Category.findAll();

    res.json({ categories });
});
