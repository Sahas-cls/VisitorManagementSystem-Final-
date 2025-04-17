module.exports = (sequelize, DataTypes) => {
  const department_Users = sequelize.define("department_Users", {
    user_Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_Name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [1, 255] },
    },
    user_email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
      unique: true,
    },
    user_category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    factory_Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // REMOVE the references here since we'll handle it in associations
    },
    mobile_No: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [10, 12],
      },
    },
    password_Reset_Token: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [2, 255],
      },
    },
    password_Reset_Token_Expired_At: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  department_Users.associate = (models) => {
    department_Users.belongsTo(models.Departments, {
      foreignKey: "Department_Id",
      as: "Department",
    });

    department_Users.belongsTo(models.Factory, { // Changed to plural to match table name
      foreignKey: "factory_Id",
      as: "factory", // Changed to singular for consistency
    });
  };

  return department_Users;
};