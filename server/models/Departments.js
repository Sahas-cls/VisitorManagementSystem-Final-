module.exports = (sequelize, DataTypes) => {
  const Departments = sequelize.define("Departments", {
    Department_Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    Factory_Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Factories",
        key: "Factory_Id",
      },
    },

    Department_Name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { max: 255 },
    },
    Department_Email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
  });

  Departments.associate = (models) => {
    // Correct foreignKey spelling
    Departments.belongsTo(models.Factory, {
      foreignKey: "Factory_Id", // Correct spelling of foreignKey
      as: "factory", // Alias for the association
    });

    Departments.hasMany(models.department_Users, {
      foreignKey: "Department_Id",
      as: "users",
    });


  };

  return Departments;
};
