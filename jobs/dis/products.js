const fetch = require('node-fetch');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const slugify = require('slugify');
const pAll = require('p-all');
const { Op } = require('sequelize');
const ms = require('ms');
const Decimal = require('decimal.js');

const db = require('../../models');
const delay = require('../../utils/delay');

const articlesPerPage = 96;

const populateCategory = async (catId, page = 0) => {
    const limit = page * articlesPerPage;
    const res = await fetch(
        `https://online.dis.rs/proizvodi.php?limit=${limit}&kat=${catId}`,
        {
            headers: {
                cookie: `privacy_policy=yes; PHPSESSID=qnchtfaf3672n12dkakceipfq2; b2c_sortArt=kategorijaPromet; b2c_brArtPoStr=96`,
            },
        },
    );

    const result = await res.buffer();
    const $ = cheerio.load(iconv.decode(result, 'win1250')); // Had to use decoding to get symbol letters to look correct

    if ($('.text-naslov-manji-crven').length) {
        return null;
    }

    const store = await db.Store.findOne({
        where: {
            code: 'dis',
        },
    });

    const products = [];
    $('[id=artikal]').each((i, el) => {
        const name = $(el).find('#artikal-naziv').text().trim();
        const slug = slugify(name.toLowerCase());
        const id = $(el).find('input[name=kolicina]').attr('id').slice(3);
        const image = $(el).find('#artikal-slika').attr('src');
        const reducedPrice = $(el).find('.tekst-artikal-cena-akcija').length;

        let price;
        if (reducedPrice) {
            price = $(el)
                .find('.tekst-artikal-cena-akcija')
                .text()
                .trim()
                .replace(',', '.');
        } else {
            price = $(el)
                .find('.tekst-artikal-cena')
                .text()
                .trim()
                .replace(',', '.');
        }

        const centPrice = new Decimal(100 * price).round();

        products.push({
            name,
            slug,
            id,
            image,
            centPrice,
            reducedPrice: !!reducedPrice,
        });
    });

    for (let i = 0; i < products.length; i++) {
        const { name, slug, id, image, centPrice, reducedPrice } = products[i];

        let product = await db.Product.findOne({
            where: {
                'references.dis': id,
            },
        });

        if (!product) {
            product = await db.Product.create({
                name,
                slug,
                image,
                references: {
                    dis: id,
                },
            });
        }

        await db.Price.upsert({
            value: centPrice,
            reducedPrice,
            date: new Date(),
            productId: product.id,
            storeId: store.id,
            reference: id,
        });
    }

    populateCategory(catId, page + 1);

    return products;
};

const populateProducts = async () => {
    const categories = await db.Category.findAll({
        where: {
            'references.dis': {
                [Op.not]: null,
            },
        },
    });

    await pAll(
        categories.map((category) => async () => {
            await populateCategory(category.references.dis);
            await delay(ms('1s'));
        }),
        {
            concurrency: 1,
        },
    );
};

module.exports = populateProducts;
