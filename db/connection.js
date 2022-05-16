const mysql = require('mysql2');

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'tracker'
    },
    console.log('Connected to the employee-tracker database.')
)


module.exports = db;