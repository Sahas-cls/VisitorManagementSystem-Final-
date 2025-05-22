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
      // Foreign key is handled by association
    },
    Department_Name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [1, 255] }, // Fixed: replaced "max" with "len"
    },
    Department_Email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
  });

  Departments.associate = (models) => {
    Departments.belongsTo(models.Factory, {
      foreignKey: "Factory_Id",
      as: "factory",
    });

    Departments.hasMany(models.department_Users, {
      foreignKey: "Department_Id",
      as: "users",
    });
  };

  return Departments;
};
