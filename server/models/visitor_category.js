module.exports = (sequelize, DataTypes) => {
  const VisitorCategory = sequelize.define("VisitorCategory", {
    visitor_category_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    visitor_category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [1, 255] },
    },
  }, {
    tableName: 'visitor_categories',
    timestamps: false // Add this if you don't have createdAt/updatedAt
  });

  return VisitorCategory;
};
