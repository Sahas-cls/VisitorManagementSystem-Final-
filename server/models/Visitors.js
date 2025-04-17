module.exports = (sequelize, DataTypes) => {
  const Visitors = sequelize.define("Visitors", {
    Visitor_Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ContactPerson_Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "ContactPersons",
        key: "ContactPerson_Id",
      },
    },
    Visitor_Name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 255],
      },
    },
    Visitor_NIC: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [10, 12], // Adjusted to match NIC format
      },
      // unique: true,
    },
  });

  Visitors.associate = (models) => {
    Visitors.belongsTo(models.ContactPersons, {
      foreignKey: "ContactPerson_Id",
      targetKey: "ContactPerson_Id",
      as: "ContactPerson",
    });

    Visitors.belongsTo(models.Visits, {
      foreignKey: "Visit_Id",
      targetKey: "Visit_Id",
      as: "Visit",
    });
  };

  return Visitors;
};
