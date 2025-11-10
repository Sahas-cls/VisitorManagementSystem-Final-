'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the new column D_User to Visits table
    await queryInterface.addColumn('Visits', 'D_User', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the column D_User if we need to revert
    await queryInterface.removeColumn('Visits', 'D_User');
  }
};
