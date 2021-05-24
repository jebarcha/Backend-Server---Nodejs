const express = require('express');
const cors = require('cors');
const { dbConnection } = require('./db/config');
require('dotenv').config();
//console.log(process.env);

// Create Server/application express
const app = express();

// DB
dbConnection();

// Public directory
app.use(express.static('public'));

// CORS
app.use(cors());

// Read and parse of body
app.use( express.json() );

// Routes
app.use('/api/auth', require('./routes/auth'));


//------------------------------
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is running in port ${port}`);
});


