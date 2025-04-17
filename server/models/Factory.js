module.exports = (sequelize, DataTypes) => {
  const Factories = sequelize.define("Factory", {
    Factory_Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Factory_Code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 40],
      },
    },
    Factory_Name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
  });

  Factories.associate = (models) => {
    Factories.hasMany(models.department_Users, {
      foreignKey: "factory_Id",
      as: "factory",  // Make sure the alias matches
    });

    Factories.hasMany(models.Departments, {
      foreignKey: "Factory_Id",
      as: "departments",  // Ensure this alias is correct as well
    });
  };

  return Factories;
};
