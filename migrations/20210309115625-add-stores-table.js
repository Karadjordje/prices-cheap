module.exports = {
    run: async (migration, Sequelize) => {
        await migration.createTable('stores', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            name: { type: Sequelize.STRING, allowNull: false },
            code: { type: Sequelize.STRING, allowNull: false }, // idea, dis
            logo: { type: Sequelize.STRING }, // url do slike
            createdAt: { type: Sequelize.DATE },
            updatedAt: { type: Sequelize.DATE },
        });
    },
};
