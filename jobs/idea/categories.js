const fetch = require('node-fetch');
const slugify = require('slugify');
const db = require('../../models');

const populateCategories = async () => {
    const res = await fetch('https://online.idea.rs/v2/categories');
    const results = await res.json();

    for (let i = 0; i < results.length; i++) {
        const { name, description, id } = results[i];

        const slug = slugify(name.toLowerCase());

        const existing = await db.Category.findOne({
            where: {
                slug,
            },
        });

        if (!existing) {
            await db.Category.create({
                name,
                description,
                slug,
                references: {
                    idea: id,
                },
            });
        } else if (existing.references.idea !== id) {
            await existing.update({
                references: {
                    ...existing.references,
                    id,
                },
            });
        }
    }
    return results;
};

module.exports = populateCategories;
