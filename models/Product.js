module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('product', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: { type: DataTypes.STRING, allowNull: false },
        slug: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT },
        image: { type: DataTypes.STRING }, // url do slike
        references: { type: DataTypes.JSONB }, // { idea: 2215123, dis: '123123' }
        // categoryId
        // createdAt
        // updatedAt
    });

    Product.associate = (models) => {
        models.Product.belongsTo(models.Category);
        models.Category.hasMany(models.Product);
    };

    return Product;
};
