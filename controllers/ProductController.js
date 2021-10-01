const Product = require('../models/Product');

const {existsOrError} = require('../functions/Validation');

class ProductController { 

    async create ( req, res){
        let { name, quantity, unitPrice, costPrice } = req.body;

        try {
            await existsOrError(name, 'Nome do produto não informado.');
            await existsOrError(quantity, 'Quantidade ão informada');
            await existsOrError(unitPrice, 'Preço unitário não informado.');
            await existsOrError(costPrice, 'Preço de custo não informado.');

            let product = await Product.findOne({ where: { name } });
            
            if(product) {
                return res.status(302).json({
                    status: res.statusCode,
                    message: 'Produto já cadastrado.'
                });
            }
        } catch (err) {
            return res.status(400).json({
                status: res.statusCode,
                err
            });
        }

        let product = await Product.create({ ...req.body });
        return res.json({
            status:res.statusCode,
            message: 'Produto cadastrado!'
        });  

    } 

}

module.exports = new ProductController();