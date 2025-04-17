const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
  const User_Categories = sequelize.define("User_Categories", {
    Category_Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Category: {
      type: DataTypes.STRING,
      allowNulll: false,
      validate: {
        len: [1, 255],
      },
    },
  });
  return User_Categories;
};
