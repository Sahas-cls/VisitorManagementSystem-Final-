module.exports = (sequelize, DataTypes) => {
  const Visits = sequelize.define("Visits", {
    Visit_Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
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
    Factory_Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Factories",
        key: "Factory_Id",
      },
    },
    // Vehicle_Id: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    //   references: {
    //     model: "Vehicles",
    //     key: "Vehicle_Id",
    //   },
    // },
    Department_Id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Departments",
        key: "Department_Id",
      },
    },
    Date_From: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    Date_To: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    Time_From: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    Time_To: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    Checkin_Time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    Checkout_Time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    Num_of_Days: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Num_of_Days_Came: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Breakfast: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    Lunch: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    Tea: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    Requested_Officer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    D_Head_Approval: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    D_Approved_By: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    HR_Approval: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    H_Approved_By: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Visitor_Category: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50],
      },
    },
    Remark: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 255],
      },
    },
    Purpose: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 255],
      },
    },
    Reference_No: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 255],
      },
    },
    Issued_Date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    Last_Modified_By: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    Total_Time: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50],
      },
    },
  });

  Visits.associate = (models) => {
    Visits.belongsTo(models.ContactPersons, {
      foreignKey: "ContactPerson_Id",
      targetKey: "ContactPerson_Id",
      as: "ContactPerson",
    });

    Visits.hasMany(models.Visitors, {
      foreignKey: "ContactPerson_Id", // Foreign key in the Visitors table
      targetKey: "ContactPerson_Id",
      as: "Visitor", // Alias for the association
    });

    // Visits.belongsTo(models.Vehicles, {
    //   foreignKey: "Vehicle_Id",
    //   targetKey: "Vehicle_Id",
    // });

    Visits.belongsTo(models.Departments, {
      foreignKey: "Department_Id",
      targetKey: "Department_Id",
      as: "Departments",
    });
  };

  return Visits;
};
