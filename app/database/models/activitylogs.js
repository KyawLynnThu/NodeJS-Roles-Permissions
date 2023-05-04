'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ActivityLogs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ActivityLogs.belongsTo(models.Admin, { foreignKey: 'causerId', as: 'causer' });
    }
  }
  ActivityLogs.init({
    module: DataTypes.STRING,
    moduleId: DataTypes.INTEGER,
    actionType: DataTypes.STRING,
    originalValue: DataTypes.JSON,
    updatedValue: DataTypes.JSON,
    causerId: DataTypes.INTEGER,
    browserInfo: DataTypes.STRING,
    deviceInfo: DataTypes.TEXT,
    ipAddress: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ActivityLogs',
  });
  return ActivityLogs;
};