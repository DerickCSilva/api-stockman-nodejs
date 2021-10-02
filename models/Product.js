const Sequelize = require('sequelize');
const connection = require('../database/connection');

const Product = connection.define('products', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    quantity: {
        type: Sequelize.STRING,
        allowNull: false
    },
    unitPrice: {
        type: Sequelize.STRING,
        allowNull: false
    },
    costPrice: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

Product.sync({ force: false })
    .then(() => console.log('Tabela de Produtos criada!'))
    .catch(err => console.log(err));

module.exports = Product;