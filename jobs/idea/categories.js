const fetch = require('node-fetch');
const slugify = require('slugify');
const db = require('../../models');

const populateCategories = async () => {
    const res = await fetch('https://online.idea.rs/v2/categories');
    const results = await res.json();

    const insertCategory = async (
        { name, description, id, children },
        parentId,
    ) => {
        const slug = slugify(name.toLowerCase());
        let existing = await db.Category.findOne({
            where: {
                'references.idea': id,
            },
        });

        if (!existing) {
            existing = await db.Category.create({
                name,
                description,
                slug,
                references: {
                    idea: id,
                },
                categoryId: parentId,
            });
        } else if (existing.references.idea !== id) {
            await existing.update({
                references: {
                    ...existing.references,
                    id,
                },
                categoryId: parentId,
            });
        }

        if (children && children.length > 0) {
            await Promise.all(
                children.map((cat) => insertCategory(cat, existing.id)),
            );
        }
    };

    for (let i = 0; i < results.length; i++) {
        const { name, description, id, children } = results[i];
        await insertCategory({ name, description, id, children });
    }
    return results;
};

module.exports = populateCategories;
