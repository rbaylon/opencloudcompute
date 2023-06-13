const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('role', {
    role_name: {
      allowNull: false,
      type: DataTypes.STRING(32),
      unique: true
    }
	});
};
