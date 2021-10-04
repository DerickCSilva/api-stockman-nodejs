// Modules
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

// Models
const Product = require('./models/Product');
const User = require('./models/User');

// Database
const connection = require('./database/connection');

// Routes
const routes = require('./routes/routes');

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set view engine
app.set('view engine', 'ejs');

// Static Files
app.use(express.static('public'));

// Connection with database
connection
    .authenticate()
    .then(() => console.log('Conexão com banco de dados feita com sucesso!'))
    .catch(err => console.log(err));

// Using Cors, Morgan and Routes
app.use(cors()); 
app.use(morgan('dev'));
app.use('/api', routes);

// Listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Backend running on port ${port} 🚀...`));