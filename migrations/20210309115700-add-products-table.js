module.exports = {
    run: async (migration, Sequelize) => {
        await migration.createTable('products', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            name: { type: Sequelize.STRING, allowNull: false },
            slug: { type: Sequelize.STRING, allowNull: false },
            description: { type: Sequelize.TEXT },
            image: { type: Sequelize.STRING }, // url do slike
            references: { type: Sequelize.JSONB }, // { idea: 2215123, dis: '123123' }
            categoryId: {
                type: Sequelize.INTEGER,
                references: { model: 'categories', key: 'id' },
            },
            createdAt: { type: Sequelize.DATE },
            updatedAt: { type: Sequelize.DATE },
        });
    },
};
