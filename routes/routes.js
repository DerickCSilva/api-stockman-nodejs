// Modules
let express = require("express");
let router = express.Router();

// Controllers
let UserController = require("../controllers/UserController");
let ProductController = require("../controllers/ProductController");

// Middleware
const authentication = require('../middlewares/authentication');

// Routes

// GET's
router.get('/users/:page', authentication, UserController.all);
router.get('/products/:page', authentication, ProductController.all);

// POST's
router.post('/user', authentication, UserController.create);
router.post('/signin', UserController.signin);
router.post('/product', authentication, ProductController.create);
router.post('/userId', authentication, UserController.getByIdOrUsername);
router.post('/search', authentication, UserController.searchUser);
router.post('/productId', authentication, ProductController.getByIdOrName);

// PATCH's
router.patch('/user', authentication, UserController.edit);
router.patch('/product', authentication, ProductController.edit);

// DELETE's
router.delete('/product', authentication, ProductController.delete);
router.delete('/user', authentication, UserController.delete);

module.exports = router;