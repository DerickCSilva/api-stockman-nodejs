// Models
const Product = require('../models/Product');

// Functions
const { existsOrError } = require('../functions/Validation');
const formatMoney = require('../functions/formatMoney');

// class ProductController
class ProductController {
    async create(req, res) {
        let { name, quantity, unitPrice, costPrice } = req.body;

        try {
            await existsOrError(name, 'Nome do produto não informado.');
            await existsOrError(quantity, 'Quantidade ão informada');
            await existsOrError(unitPrice, 'Preço unitário não informado.');
            await existsOrError(costPrice, 'Preço de custo não informado.');

            let product = await Product.findOne({ where: { name } });

            if (product) {
                return res.status(302).json({
                    status: res.statusCode,
                    message: 'Produto já cadastrado.'
                });
            }
        } catch (err) {
            return res.status(500).json({
                status: res.statusCode,
                err
            });
        }

        try {
            await Product.create({ ...req.body });

            return res.json({
                status: res.statusCode,
                message: 'Produto cadastrado!'
            });
        } catch (err) {
            return res.status(500).json({
                status: res.statusCode,
                err
            });
        }
    }

    async allProducts(req, res) {
        try {
            let { page } = req.params || 1;
            
            if (!(page >= 1)) {
                return res.status(400).json({
                    status: res.statusCode,
                    message: 'Número de página inválido!'
                });
            }
            
            let offset;
            let limit = 10;

            // Definindo a partir de qual registro da tabela será feito a busca
            offset = isNaN(page) || page == 1 ? 0 : (parseInt(page) - 1) * limit;

            page = parseInt(page);

            let products = await Product.findAll({
                limit,
                offset,
                order: [
                    ['id', 'desc']
                ]
            });

            let nextProducts = await Product.findAll({
                limit,
                offset: offset + 10,
                order: [
                    ['id', 'desc']
                ]
            });

            let nextPage;

            if(nextProducts.length > 0) {
                nextPage = true;
            } else {
                nextPage = false;
            }

            let values = products.map(product => {
                let unitPriceFormatted = formatMoney(product.unitPrice);
                let costPriceFormatted = formatMoney(product.costPrice);
                product.unitPrice = unitPriceFormatted;
                product.costPrice = costPriceFormatted;
            });

            return res.json({
                status: res.statusCode,
                products,
                page: page + 1,
                nextPage
            });
        } catch (err) {
            console.error(err)
            return res.status(500).json({
                status: res.statusCode,
                err
            });
        }
    }
}

module.exports = new ProductController();