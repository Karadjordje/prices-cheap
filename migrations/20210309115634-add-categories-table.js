module.exports = {
    run: async (migration, Sequelize) => {
        await migration.createTable('categories', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            name: { type: Sequelize.STRING, allowNull: false },
            slug: { type: Sequelize.STRING, allowNull: false },
            description: { type: Sequelize.TEXT },
            references: { type: Sequelize.JSONB, defaultValue: {} }, // { idea: 5 }
            categoryId: {
                type: Sequelize.INTEGER,
                references: { model: 'categories', key: 'id' },
            },
            createdAt: { type: Sequelize.DATE },
            updatedAt: { type: Sequelize.DATE },
        });
    },
};
