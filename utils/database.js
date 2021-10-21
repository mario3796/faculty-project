const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
    host: 'localhost',
    username: 'root',
    password: 'Iwbi3796!',
    dialect: 'mysql',
    database: 'faculty'
});

module.exports = sequelize;
