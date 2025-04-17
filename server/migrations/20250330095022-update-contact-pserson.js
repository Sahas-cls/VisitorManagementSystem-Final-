"use strict";

const { query } = require("express-validator");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.changeColumn("ContactPersons", "ContactPerson_Email", {
      type: Sequelize.STRING,
      allowNull: true, // Allow null values for the email field
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn("ContactPersons", "ContactPerson_Email", {
      type: Sequelize.STRING,
      allowNull: false, // Revert the change if rolling back the migration
    });
  },
};
