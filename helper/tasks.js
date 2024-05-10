// Include packages needed for this application
require('dotenv').config();
const inquirer = require("inquirer");
const { Pool } = require('pg');

// // Connect to database
const pool = new Pool(
    {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: 'localhost',
        database: process.env.DB_NAME
    },
)
