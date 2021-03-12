const fetch = require('node-fetch');
const slugify = require('slugify');
const db = require('../../models');

const populateCategories = async (catId = 0) => {
    const searchCategory = catId.toString().padStart(2, '0');

    const res = await fetch(
        `https://www.maxi.rs/online/c/${searchCategory}/loadMore?pageSize=200&pageNumber=0&sort=relevance`,
    );

    if (res.status !== 200) {
        return;
    }

    const results = await res.json();

    const { categoryName, categoryCode: id } = results;
    const slug = slugify(categoryName.toLowerCase());

    const existing = await db.Category.findOne({
        where: { slug },
    });

    if (!existing) {
        await db.Category.create({
            name: categoryName,
            slug,
            references: {
                maxi: id,
            },
        });
    } else if (existing.references.maxi !== id) {
        await existing.update({
            references: {
                ...existing.references,
                id,
            },
        });
    }

    await populateCategories(catId + 1);
};

module.exports = populateCategories;
