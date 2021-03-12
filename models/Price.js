module.exports = (sequelize, DataTypes) => {
    const Price = sequelize.define('price', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        value: { type: DataTypes.INTEGER, allowNull: false },
        date: { type: DataTypes.DATEONLY, allowNull: false },
        // storeId
        // productId
        // createdAt
        // updatedAt
    });

    Price.associate = (models) => {
        models.Product.belongsToMany(models.Store, { through: models.Price });
        models.Store.belongsToMany(models.Product, { through: models.Price });
    };

    return Price;
};
