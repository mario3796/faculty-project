const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {});

module.exports = Course;