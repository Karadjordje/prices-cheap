const fetch = require('node-fetch');
const slugify = require('slugify');
const pAll = require('p-all');
const { Op } = require('sequelize');
const ms = require('ms');
const Decimal = require('decimal.js');
const db = require('../../models');
const delay = require('../../utils/delay');

const maxiImagesBaseUrl = 'https://d3el976p2k4mvu.cloudfront.net';

const populateCategory = async (catId, page = 0) => {
    const res = await fetch(
        `https://www.maxi.rs/online/c/${catId}/loadMore?pageSize=200&pageNumber=${page}&sort=relevance`,
    );

    const results = await res.json();
    const { results: products, pagination: _page } = results;

    const store = await db.Store.findOne({
        where: {
            code: 'maxi',
        },
    });

    for (let i = 0; i < products.length; i++) {
        const {
            name,
            description,
            images,
            code: id,
            price: { value: price },
        } = products[i];

        const imageUrl = images ? images[0].url : null; // There are products without images
        const centPrice = new Decimal(100 * price).round();

        const slug = slugify(name.toLowerCase());

        let product = await db.Product.findOne({
            where: {
                'references.maxi': id,
            },
        });

        if (!product) {
            product = await db.Product.create({
                name,
                description,
                slug,
                image: `${maxiImagesBaseUrl}/${imageUrl}`,
                references: {
                    maxi: id,
                },
            });
        }

        await db.Price.upsert({
            value: centPrice,
            date: new Date(),
            productId: product.id,
            storeId: store.id,
            reference: id,
        });
    }

    if (_page.page_count > page + 1) {
        await populateCategory(catId, page + 1);
    }

    return products;
};

const populateProducts = async () => {
    const categories = await db.Category.findAll({
        where: {
            'references.maxi': {
                [Op.not]: null,
            },
        },
    });

    await pAll(
        categories.map((category) => async () => {
            await populateCategory(category.references.maxi);
            await delay(ms('1s'));
        }),
        {
            concurrency: 1,
        },
    );
};

module.exports = populateProducts;
