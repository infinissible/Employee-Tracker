const db = require('./db/connection');
const cTable = require('console.table');

const viewRoles = function() {
  const sql = `SELECT roles.id, roles.title, department.name 
              AS department, roles.salary 
              FROM roles LEFT JOIN department 
              ON roles.department_id = department.id`
  db.query(sql, function (err, results) {
  console.table(results);
  });
}

viewRoles();
 