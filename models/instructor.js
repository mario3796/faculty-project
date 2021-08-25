const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Instructor = sequelize.define('Instructor', {
    department: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {});

module.exports = Instructor;