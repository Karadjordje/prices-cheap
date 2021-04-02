const fetch = require('node-fetch');
const cheerio = require('cheerio');
const slugify = require('slugify');

const pAll = require('p-all');
const db = require('../../models');

const URL = 'https://www.maxi.rs/online';

const findCategories = async () => {
    const res = await fetch(URL);
    const body = await res.text();

    const $ = cheerio.load(body);

    const mapCategory = (el) => {
        const name = $(el).find('a').first().text();
        const slug = slugify(name.toLowerCase());
        const catUrl = $(el).find('a').first().attr('href');
        const id = catUrl.split('/').pop();
        const subcategories = [];

        const childEls = $(el)
            .children('.level-container')
            .children('ul')
            .children('li');

        if (childEls.length > 0) {
            childEls.each((i, li) => {
                subcategories.push(mapCategory(li));
            });
        }

        return {
            name,
            slug,
            catUrl,
            id,
            subcategories,
        };
    };

    const catSelector = $('.LeftHandNav .top-level-container > ul > li');
    const allCategories = catSelector.slice(2, catSelector.length - 3);

    const categories = [];
    allCategories.map((i, el) => categories.push(mapCategory(el)));
    return categories;
};

const populateCategories = async () => {
    const categories = await findCategories();

    const insertCategory = async (
        { slug, name, id, subcategories },
        parentId,
    ) => {
        let existing = await db.Category.findOne({
            where: {
                'references.maxi': id,
            },
        });

        if (!existing) {
            existing = await db.Category.create({
                name,
                slug,
                references: {
                    maxi: id,
                },
                categoryId: parentId,
            });
        } else if (existing.references.maxi !== id) {
            await existing.update({
                references: {
                    ...existing.references,
                    id,
                },
                categoryId: parentId,
            });
        }
        if (subcategories && subcategories.length > 0) {
            await Promise.all(
                subcategories.map((cat) => insertCategory(cat, existing.id)),
            );
        }
    };

    await pAll(
        categories.map((category) => async () => {
            await insertCategory(category);
        }),
        {
            concurrency: 1,
        },
    );
};

module.exports = populateCategories;
