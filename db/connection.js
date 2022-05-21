const mysql = require('mysql2');

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'tracker',
  },
  console.log('Connected to DB')
);

module.exports = db;
