const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Student = sequelize.define('Student', {
    department: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {});

module.exports = Student;