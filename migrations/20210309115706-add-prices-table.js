module.exports = {
    run: async (migration, Sequelize) => {
        await migration.createTable('prices', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            value: { type: Sequelize.INTEGER, allowNull: false },
            date: { type: Sequelize.DATEONLY, allowNull: false },
            reducedPrice: { type: Sequelize.BOOLEAN, allowNull: false },
            storeId: {
                type: Sequelize.INTEGER,
                references: { model: 'stores', key: 'id' },
            },
            productId: {
                type: Sequelize.INTEGER,
                references: { model: 'products', key: 'id' },
            },
            createdAt: { type: Sequelize.DATE },
            updatedAt: { type: Sequelize.DATE },
        });
        migration.addConstraint('prices', {
            fields: ['storeId', 'productId'],
            type: 'unique',
            name: 'store_product',
        });
    },
};
