module.exports = (sequelize, DataTypes) => {
    const Store = sequelize.define('store', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: { type: DataTypes.STRING, allowNull: false },
        code: { type: DataTypes.STRING, allowNull: false }, // idea, dis
        logo: { type: DataTypes.STRING }, // url do slike
        // createdAt
        // updatedAt
    });

    Store.associate = () => {};

    return Store;
};
