const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('token', {
    token: {
      allowNull: false,
      type: DataTypes.STRING(),
      unique: true
    },
    active: {
      allowNull: false,
      type: DataTypes.BOOLEAN()
    }
	});
};
