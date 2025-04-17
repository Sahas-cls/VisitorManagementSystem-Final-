module.exports = (sequelize, DataTypes) => {
  const Vehicles = sequelize.define("Vehicles", {
    Vehicle_Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    ContactPerson_Id: {
      type: DataTypes.INTEGER,
      references: {
        model: "ContactPersons",
        key: "ContactPerson_Id",
      },
    },
    Vehicle_Type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Vehicle_No: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
    },
  });

  Vehicles.associate = (models) => {
    Vehicles.belongsTo(models.ContactPersons, {
      foreignKey: "ContactPerson_Id",
      targetKey: "ContactPerson_Id",
      as: "Vehicles",
    });
  };

  return Vehicles;
};
