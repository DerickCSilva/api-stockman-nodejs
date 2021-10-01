// Modules
require('dotenv').config();
const Sequelize = require('sequelize');

const connection = new Sequelize(process.env.DATABASE, process.env.USER, process.env.PASSWORD, {
    host: process.env.HOST,
    dialect: 'mysql',
    timezone: '-03:00'    
});

module.exports = connection;