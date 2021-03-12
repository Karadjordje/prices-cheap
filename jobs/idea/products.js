const fetch = require('node-fetch');
const slugify = require('slugify');
const pAll = require('p-all');
const { Op } = require('sequelize');
const ms = require('ms');
const db = require('../../models');
const delay = require('../../utils/delay');

const ideaBaseUrl = 'online.idea.rs';

const populateCategory = async (catId, page = 1) => {
    const res = await fetch(
        `https://online.idea.rs/v2/categories/${catId}/products?per_page=48&page=${page}`,
    );
    const results = await res.json();
    const { products, _page } = results;
    const store = await db.Store.findOne({
        where: {
            code: 'idea',
        },
    });

    for (let i = 0; i < products.length; i++) {
        const { name, description, image_path: imageUrl, id, price } = products[
            i
        ];

        const slug = slugify(name.toLowerCase());

        let product = await db.Product.findOne({
            where: {
                'references.idea': id,
            },
        });

        if (!product) {
            product = await db.Product.create({
                name,
                description,
                slug,
                image: `${ideaBaseUrl}/${imageUrl}`,
                references: {
                    idea: id,
                },
            });
        }

        await db.Price.upsert({
            value: price.amount,
            date: new Date(),
            productId: product.id,
            storeId: store.id,
            reference: id,
        });
    }

    if (_page.page_count > page) {
        await populateCategory(catId, page + 1);
    }

    return products;
};

const populateProducts = async () => {
    const categories = await db.Category.findAll({
        where: {
            'references.idea': {
                [Op.not]: null,
            },
        },
    });

    await pAll(
        categories.map((category) => async () => {
            await populateCategory(category.references.idea);
            await delay(ms('1s'));
        }),
        {
            concurrency: 1,
        },
    );
};

module.exports = populateProducts;
