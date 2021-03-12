module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('category', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: { type: DataTypes.STRING, allowNull: false },
        slug: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT },
        references: { type: DataTypes.JSONB, defaultValue: {} }, // { idea: 5 }
        // createdAt
        // updatedAt
    });

    return Category;
};
