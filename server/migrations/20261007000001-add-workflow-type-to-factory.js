'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Factories', 'Country', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    // 'STANDARD' = Group 1 (Sri Lankan flow), 'HR_ONLY' = Group 2 (HR-only approval)
    await queryInterface.addColumn('Factories', 'Workflow_Type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'STANDARD',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Factories', 'Workflow_Type');
    await queryInterface.removeColumn('Factories', 'Country');
  },
};
