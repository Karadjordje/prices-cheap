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
        reducedPrice: { type: DataTypes.BOOLEAN, allowNull: false },
        // storeId
        // productId
        // createdAt
        // updatedAt
    });

    Price.associate = (models) => {
        models.Product.belongsToMany(models.Store, { through: models.Price });
        models.Store.belongsToMany(models.Product, { through: models.Price });

        models.Price.belongsTo(models.Product);
        models.Product.hasMany(models.Price);

        models.Price.belongsTo(models.Store);
        models.Store.hasMany(models.Price);
    };

    return Price;
};
