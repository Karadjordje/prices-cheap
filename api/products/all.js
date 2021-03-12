const api = require('../api');
const { Product, Store, Price } = require('../../models');

api.get('/products', async (req, res) => {
    const products = await Product.findAll({
        // where: {
        // name: 'Coko'
        // },
        include: [
            {
                model: Store,
                through: Price,
            },
        ],
    });

    res.json({ products });
});
