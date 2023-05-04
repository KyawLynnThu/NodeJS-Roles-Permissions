'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AdminRole extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Admin.belongsToMany(models.Role, { through: AdminRole, foreignKey: 'adminId' });
      models.Role.belongsToMany(models.Admin, { through: AdminRole, foreignKey: 'roleId' });
    }
  }
  AdminRole.init({
    adminId: DataTypes.INTEGER,
    roleId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'AdminRole',
  });
  return AdminRole;
};