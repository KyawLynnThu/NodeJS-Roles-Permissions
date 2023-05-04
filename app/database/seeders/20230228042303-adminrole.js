module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('AdminRoles', [
      {
        adminId: 1,
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
  ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('AdminRoles', null, {});
  }
};
