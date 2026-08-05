"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Visits", "Date_From", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.changeColumn("Visits", "Date_To", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Visits", "Date_From", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.changeColumn("Visits", "Date_To", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },
};
