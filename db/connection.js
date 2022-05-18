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

// db.promise().query("SELECT 1")
//     .then( ([rows, fields]) => {
//         console.log(rows);
//     })
//     .catch(console.log)
//     .then( () => con.end());

module.exports = db;
