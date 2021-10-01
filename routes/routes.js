// Modules
let express = require("express");
let router = express.Router();

// Controllers
let UserController = require("../controllers/UserController");
let ProductController = require("../controllers/ProductController");

// Routes

// GET's

// POST's
router.post('/user', UserController.create);
router.post('/signin', UserController.signin);
router.post('/product', ProductController.create);

module.exports = router;