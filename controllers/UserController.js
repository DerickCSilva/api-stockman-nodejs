// Modules
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Models
const User = require('../models/User');

// Functions
const { existsOrError, equalsOrError } = require('../functions/Validation');

// Secret
const JwtSecret = 'qj6C0!ZTv9LH5p2$80MM3MAny@XS&ol^^LGm3Uj&DlEKk!@^Vt';

// class UserController
class UserController {
    async create(req, res) {
        let { name, username, email, password, confirmPassword, admin, telephone, birthDate } = req.body;

        const encryptPassword = (password) => {
            const salt = bcrypt.genSaltSync(10)
            return bcrypt.hashSync(password, salt)
        }

        try {
            await existsOrError(name, 'Nome do usuário não informado.');
            await existsOrError(email, 'E-mail não informado.');
            await existsOrError(username, 'Username (apelido) não informado.');
            await existsOrError(password, 'Senha não informada.');
            await existsOrError(confirmPassword, 'Confirmação de senha não informada.');
            await equalsOrError(password, confirmPassword, 'Senhas não conferem.');
            await existsOrError(admin, 'Usuário administrador não informado.');
            await existsOrError(telephone, 'Telefone não informado.');
            await existsOrError(birthDate, 'Data de nascimento não informado.');

            const user = await User.findOne({ where: { username } });
            
            if(user) {
                return res.status(302).json({
                    status: res.statusCode,
                    message: 'Usuário já cadastrado.'
                });
            }
        } catch (err) {
            return res.status(400).json({
                status: res.statusCode,
                err
            });
        }
        
        let hash = encryptPassword(password);

        let user = await User.create({ ...req.body, password: hash });

        res.json({
            status: res.statusCode,
            message: 'Usuário cadastrado!'
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
            console.log(err);
            return res.status(500).json({
                status: res.statusCode,
                err
            });
        }

        let { id, email, admin } = user;

        if (!user) {
            return res.status(404).json({
                status: res.statusCode,
                message: 'Usuário não encontrado!'
            });
        }

        let confirmPass = bcrypt.compareSync(password, user.password);

        if (!confirmPass) {
            return res.status(401).json({
                status: res.statusCode,
                message: 'Senha inválida!'
            });
        }

        let payload = {
            id,
            username,
            email,
            admin
        }

        jwt.sign(payload, JwtSecret, { expiresIn: '2h' }, (err, token) => {
            if(err) {
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
}

module.exports = new UserController();