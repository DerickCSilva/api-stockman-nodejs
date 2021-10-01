// Modules
let express = require("express");
let router = express.Router();

// Controllers
let UserController = require("../controllers/UserController");

// Routes

// GET's

// POST's
router.post('/create/user', UserController.create);
router.post('/signin', UserController.signin);

module.exports = router;