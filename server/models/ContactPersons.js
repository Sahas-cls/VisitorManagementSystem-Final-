module.exports = (sequelize, DataTypes) => {
  const ContactPersons = sequelize.define("ContactPersons", {
    ContactPerson_Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    ContactPerson_Name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 255],
      },
    },
    ContactPerson_NIC: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
      validate: {
        len: [10, 12],
      },
    },
    ContactPerson_ContactNo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [9, 12],
      },
    },
    ContactPerson_Email: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null values
    },
  });

  ContactPersons.associate = (models) => {
    ContactPersons.hasMany(models.Visits, {
      foreignKey: "ContactPerson_Id",
      targetKey: "ContactPerson_Id",
      as: "Visits",
    });

    ContactPersons.hasMany(models.Visitors, {
      foreignKey: "ContactPerson_Id",
      targetKey: "ContactPerson_Id",
      as: "Visitors",
    });

    ContactPersons.hasMany(models.Vehicles, {
      foreignKey: "ContactPerson_Id",
      targetKey: "ContactPerson_Id",
      as: "Vehicles",
    });
  };

  return ContactPersons;
};
