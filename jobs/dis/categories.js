const fetch = require('node-fetch');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const slugify = require('slugify');
const pAll = require('p-all');
const getSessionId = require('./get-session-id');
const db = require('../../models');

const URL = 'https://online.dis.rs/proizvodi.php';

const populateCategories = async () => {
    const sessionId = await getSessionId();

    if (!sessionId) {
        // eslint-disable-next-line no-console
        console.log('There was an error with getting session ID!');
        return;
    }

    const res = await fetch(URL, {
        headers: {
            cookie: `privacy_policy=yes; PHPSESSID=${sessionId}; b2c_sortArt=kategorijaPromet; b2c_brArtPoStr=96`,
        },
    });

    const result = await res.buffer();
    const $ = cheerio.load(iconv.decode(result, 'win1250')); // Had to use decoding to get symbol letters to look correct

    const categories = [];
    $('#menikat ul > li > a:first-child').each((i, el) => {
        const name = $(el).text().trim();
        const slug = slugify(name.toLowerCase());
        const catUrl = $(el).attr('onclick');

        // We filter out links that are not categories
        if (!catUrl.includes('?kat=')) {
            return;
        }

        const id = catUrl.match(/\?kat=(.*)'/)[1];

        const children = $(el).siblings('ul');
        const subcategories = [];

        // Check for child categories
        if (children.length) {
            children.find('a').each((index, elem) => {
                const childName = $(elem).text().trim();
                const childSlug = slugify(childName.toLowerCase());
                const childCatUrl = $(elem).attr('onclick');
                const childId = childCatUrl.match(/\?kat=(.*)'/)[1];

                // Push data for child categories
                subcategories.push({
                    name: childName,
                    slug: childSlug,
                    id: childId,
                    categoryId: id,
                });
            });
        }
        // Push data for main category
        categories.push({
            name,
            slug,
            id,
            subcategories,
        });
    });

    const insertCategory = async (
        { slug, name, id, subcategories },
        parentId,
    ) => {
        let existing = await db.Category.findOne({
            where: {
                slug,
            },
        });

        if (!existing) {
            existing = await db.Category.create({
                name,
                slug,
                references: {
                    dis: id,
                },
                categoryId: parentId,
            });
        } else if (existing.references.dis !== id) {
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
