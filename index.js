const db = require('./db/connection');
const cTable = require('console.table');
const inquirer = require('inquirer');

async function promise(sql) {
  await db
    .promise()
    .query(sql)
    .then(([rows, fields]) => {
      console.table(rows);
    });
  await initialize();
}

async function viewAllRoles() {
  const sql = `SELECT roles.id, roles.title, department.name 
              AS department, roles.salary 
              FROM roles LEFT JOIN department 
              ON roles.department_id = department.id`;
  promise(sql);
}

async function viewAllEmployee() {
  const sql = `SELECT b.id, b.first_name, b.last_name,
  roles.title AS title, department.name AS department, roles.salary,
  IFNULL(CONCAT(a.first_name, " ", a.last_name), 'null') AS manager
    FROM employee b
    LEFT JOIN roles ON b.role_id = roles.id
    LEFT JOIN department ON roles.department_id = department.id
    LEFT JOIN employee a ON a.id = b.manager_id;`;

  // await db
  //   .promise()
  //   .query(sql)
  //   .then(([rows, fields]) => {
  //     console.table(rows);
  //   });
  // await initialize();
  promise(sql);
}

async function viewAllDepartments() {
  const sql = `SELECT * FROM department`;

  promise(sql);
}

async function initialize() {
  await inquirer
    .prompt({
      type: 'list',
      message: 'What would you like to do?',
      name: 'choice',
      choices: [
        'View All Employees',
        'Add Employee',
        'Update Employee Role',
        'View All Roles',
        'Add Role',
        'View All Departments',
        'Add Department',
        'Quit',
      ],
    })
    .then(({ choice }) => {
      if (choice === 'View All Employees') {
        viewAllEmployee();
      } else if (choice === 'View All Roles') {
        viewAllRoles();
      } else if (choice === 'View All Departments') {
        viewAllDepartments();
      }
    });
  await initialize();
}

initialize();

// viewAllRoles();
// viewAllEmployee();
