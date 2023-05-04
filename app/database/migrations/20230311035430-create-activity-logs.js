'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ActivityLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      module: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: 'Admin, Role, Permission, Location, Post, User'
      },
      moduleId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      actionType: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: 'Created, Updated, Deleted'
      },
      originalValue: {
        allowNull: true,
        type: Sequelize.JSON
      },
      updatedValue: {
        allowNull: true,
        type: Sequelize.JSON
      },
      causerId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Admins',
          key: 'id'
        }
      },
      browserInfo: {
        allowNull: true,
        type: Sequelize.STRING
      },
      deviceInfo: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      ipAddress: {
        allowNull: true,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ActivityLogs');
  }
};