const bcrypt = require("bcrypt");
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Admins", [
      {
        name: "SuperAdmin",
        email: "superadmin@gmail.com",
        password: bcrypt.hashSync("@dminPass13", 8),
        phone: "09953007198",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Admins", null, {});
  },
};
