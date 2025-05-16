module.exports = (sequelize, DataTypes) => {
  const VisitingPurpose = sequelize.define(
    "VisitingPurpose",
    {
      visiting_purpose_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      visiting_purpose: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { len: [1, 255] },
      },
      visitor_category_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "visitor_categories",
          key: "visitor_category_id",
        },
      },
    },
    {
      tableName: "visiting_purpose",
      timestamps: false,
    }
  );

  VisitingPurpose.associate = (models) => {
    VisitingPurpose.belongsTo(models.VisitorCategory, {
      foreignKey: "visitor_category_id",
      targetKey: "visitor_category_id",
      as: "visitor_category", // or whatever alias you prefer
    });
  };

  return VisitingPurpose;
};
