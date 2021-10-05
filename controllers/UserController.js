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
        let { name, email, username, telephone, birthDate } = req.body;

        try {
            await existsOrError(name, 'Nome do usuário não informado.');
            await existsOrError(email, 'E-mail não informado.');
            await existsOrError(telephone, 'Telefone não informado.');
            await existsOrError(birthDate, 'Data de nascimento não informado.');
        } catch (err) {
            return res.json({
                status: 400,
                err
            });
        }

        if (!username) {
            let nameBySpace = name.split(' ');
            let firstName = nameBySpace[0];
            let lastName;

            if (nameBySpace.length > 1) {
                lastName = nameBySpace[nameBySpace.length - 1];
            } else {
                lastName = '';
            }

            username = (firstName + lastName).toLowerCase();

            username = username.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        }

        let birthDateForPass = birthDate.replace(/\//g, '');;

        try {
            let user = await User.findOne({
                where: {
                    [Op.or]: [
                        { username },
                        { email }
                    ]
                }
            });

            if (user) {
                return res.json({
                    status: 302,
                    err: 'E-mail ou Username já cadastrado!'
                });
            }
        } catch (err) {
            return res.json({
                status: 400,
                err
            });
        }

        let hash = encryptPassword(birthDateForPass);

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
            return res.json({
                status: 404,
                err: 'Usuário não encontrado!'
            });
        }

        let { id, email, admin } = user;

        let confirmPass = bcrypt.compareSync(password, user.password);

        if (!confirmPass) {
            return res.json({
                status: 401,
                err: 'Senha inválida!'
            });
        }

        let payload = {
            id,
            username,
            email,
            admin
        }

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '4h' }, (err, token) => {
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
            await existsOrError(email, 'E-mail do usuário não informado!');
            await existsOrError(telephone, 'Telefone do usuário não informado!');
            await existsOrError(birthDate, 'Data de nascimento não informada!');
        } catch (err) {
            return res.json({
                status: 400,
                err
            });
        }

        let birthDateForPass = birthDate.replace(/\//g, '');

        try {
            let user = await User.findOne({ where: { id } });

            let hash = encryptPassword(birthDateForPass);

            if (user) {
                await User.update({
                    name,
                    email,
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
                return res.json({
                    status: 404,
                    err: 'Usuário não encontrado!'
                });
            }
        } catch (err) {
            console.log(err);
            return res.json({
                status: statusCode,
                err
            });
        }
    }

    async delete(req, res) {
        let { id } = req.body;

        try {
            await existsOrError(id, 'ID não informado!');

            let user = await User.destroy({ where: { id } });

            if (user) {
                return res.json({
                    status: 200,
                    err: 'Usuário deletado com sucesso!'
                });
            } else {
                return res.json({
                    status: 404,
                    err: 'Usuário inexistente!'
                });
            }

        } catch (err) {
            return res.json({
                status: 400,
                err
            });
        }

    }

    async getByIdOrUsername(req, res) {
        let { id, username } = req.body;
        let user;

        try {
            id = id || '';
            if (id.length == 0) {
                await existsOrError(username, 'Username não informado!');
                user = await User.findAll({
                    where: {
                        username: { [Op.like]: `%${username}%` }
                    }
                });
            } else {
                await existsOrError(id, 'ID não informado!');
                user = await User.findAll({ where: { id } });
            }
        } catch (err) {
            console.log(err);
            return res.json({
                status: 400,
                err
            });
        }

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

    async searchUser(req, res) {
        let { name } = req.body;
        let user;

        try {
            await existsOrError(name, 'Nome do usuário não informado!');
            user = await User.findAll({
                where: {
                    username: { [Op.like]: `%${name}%` }
                }
            });
        } catch (err) {
            console.log(err);
            return res.json({
                status: 400,
                err
            });
        }

        if (user) {
            return res.json({
                status: res.statusCode,
                user
            });
        } else {
            return res.json({
                status: 404,
                err: 'Nenhum usuário encontrado!'
            });
        }
    }
}

module.exports = new UserController();