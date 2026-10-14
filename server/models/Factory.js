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
    Country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // 'STANDARD' = Group 1 (full approval flow), 'HR_ONLY' = Group 2 (HR-only approval)
    Workflow_Type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "STANDARD",
    },
  });

  Factories.associate = (models) => {
    Factories.hasMany(models.department_Users, {
      foreignKey: "Factory_Id", // Fixed case to match Departments
      as: "departmentUsers", // Changed alias for clarity (not required elsewhere)
    });

    Factories.hasMany(models.Departments, {
      foreignKey: "Factory_Id",
      as: "departments",
    });
  };

  return Factories;
};
