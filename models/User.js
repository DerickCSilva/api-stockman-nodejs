const Sequelize = require('sequelize');
const connection = require('../database/connection');

const User = connection.define('users', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: true
    },
    password: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    admin: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    telephone: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    birthDate: {
        type: Sequelize.TEXT,
        allowNull: false
    }
});

User.sync({ force: false })
    .then(() => console.log('Tabela de Usuários criada!'))
    .catch(err => console.log(err));

module.exports = User;