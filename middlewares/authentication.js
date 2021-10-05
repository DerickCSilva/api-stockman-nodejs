// Modules
require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authToken = req.headers['authorization'];

    if(authToken) {
        const authorization = authToken.split(' ');
        const token = authorization[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
            if(err) {
                res.json({
                    status: 401,
                    err: 'Token inválido ou inspirado. Faça o login novamente no sistema!'
                });
            } else {
                req.token = token;
                next();
            }
        });
    } else {
        res.json({
            status: 401,
            err: 'Token inválido ou inspirado, logue novamente no sistema!'
        });
    }
}