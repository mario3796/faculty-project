const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
    host: 'localhost',
    username: 'your_username',
    password: 'your_password',
    dialect: 'mysql',
    database: 'faculty'
});

module.exports = sequelize;
