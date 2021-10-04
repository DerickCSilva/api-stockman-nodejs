// Modules
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

// Models
const User = require('../models/User');

// Functions
const { existsOrError } = require('../functions/Validation');

const encryptPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
}

// class UserController
class UserController {
    async create(req, res) {
        let { name, email, admin, telephone, birthDate } = req.body;

        let nameBySpace = name.split(' ');
        let firstName = nameBySpace[0];
        let lastName = nameBySpace[nameBySpace.length - 1];

        let username = (firstName + lastName).toLowerCase();

        try {
            await existsOrError(name, 'Nome do usuário não informado.');
            await existsOrError(email, 'E-mail não informado.');
            await existsOrError(admin, 'Usuário administrador não informado.');
            await existsOrError(telephone, 'Telefone não informado.');
            await existsOrError(birthDate, 'Data de nascimento não informado.');

            birthDate = birthDate.replace(/\//g, '');

            let user = await User.findOne({
                where: {
                    [Op.or]: [
                        { username },
                        { email }
                    ]
                }
            });

            if (user) {
                return res.status(302).json({
                    status: res.statusCode,
                    err: 'Usuário já cadastrado.'
                });
            }
        } catch (err) {
            return res.status(500).json({
                status: res.statusCode,
                err
            });
        }

        let hash = encryptPassword(birthDate);

        await User.create({ ...req.body, password: hash, username });

        res.json({
            status: res.statusCode,
            err: 'Usuário cadastrado!'
        });
    }

    async signin(req, res) {
        let { username, password } = req.body;

        let user;

        try {
            await existsOrError(username, 'Informe o seu usuário!');
            await existsOrError(password, 'Informe a sua senha!');

            user = await User.findOne({ where: { username } });
        } catch (err) {
            return res.json({
                status: 204,
                err
            });
        }

        if (!user) {
            return res.status(200).json({
                status: 404,
                err: 'Usuário não encontrado!'
            });
        }

        let { id, email, admin } = user;

        let confirmPass = bcrypt.compareSync(password, user.password);

        if (!confirmPass) {
            return res.status(401).json({
                status: res.statusCode,
                err: 'Senha inválida!'
            });
        }

        let payload = {
            id,
            username,
            email,
            admin
        }

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' }, (err, token) => {
            if (err) {
                return res.status(500).json({
                    status: res.statusCode,
                    err
                });
            } else {
                return res.json({
                    status: res.statusCode,
                    ...payload,
                    token
                });
            }
        });
    }

    async all(req, res) {
        try {
            let { page } = req.params || 1;

            if (!(page >= 1)) {
                return res.status(400).json({
                    status: res.statusCode,
                    err: 'Número de página inválido!'
                });
            }

            let offset;
            let limit = 10;

            // Definindo a partir de qual registro da tabela será feito a busca
            offset = isNaN(page) || page == 1 ? 0 : (parseInt(page) - 1) * limit;

            page = parseInt(page);

            let users = await User.findAll({
                limit,
                offset,
                order: [
                    ['id', 'desc']
                ]
            });

            let nextUsers = await User.findAll({
                limit,
                offset: offset + 10,
                order: [
                    ['id', 'desc']
                ]
            });

            let nextPage;

            if (nextUsers.length > 0) {
                nextPage = true;
            } else {
                nextPage = false;
            }

            return res.json({
                status: res.statusCode,
                users,
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

    async edit(req, res) {
        let { id, name, email, admin, telephone, birthDate } = req.body;

        try {
            await existsOrError(id, 'ID do usuário não informado!');
            await existsOrError(name, 'Nome do usuário não informado!');
            await existsOrError(birthDate, 'Data de nascimento não informada!');
            await existsOrError(email, 'E-mail do usuário não informado!');
        } catch (err) {
            return res.status(400).json({
                status: res.statusCode,
                err
            });
        }

        let nameBySpace = name.split(' ');
        let firstName = nameBySpace[0];
        let lastName = nameBySpace[nameBySpace.length - 1];

        let username = (firstName + lastName).toLowerCase();

        birthDate = birthDate.replace(/\//g, '');

        try {
            let user = await User.findOne({ where: { id } });

            let hash = encryptPassword(birthDate);

            if (user) {
                await User.update({
                    name,
                    email,
                    username,
                    password: hash,
                    admin,
                    telephone,
                    birthDate
                }, {
                    where: { id }
                });

                return res.json({
                    status: res.statusCode,
                    err: 'Usuário alterado com sucesso!'
                });
            } else {
                return res.status(404).json({
                    status: res.statusCode,
                    err: 'Usuário não encontrado!'
                });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                status: res.statusCode,
                err
            });
        }
    }

    async getById(req, res) {
        let { username } = req.body;

        let user = await User.findOne({ where: { username } });

        if (user) {
            return res.json({
                status: res.statusCode,
                user
            });
        } else {
            return res.json({
                status: 404,
                err: 'Usuário não encontrado!'
            });
        }
    }
}

module.exports = new UserController();