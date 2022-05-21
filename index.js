const db = require('./db/connection');
const cTable = require('console.table');
const inquirer = require('inquirer');

//////////////////////////// View function ///////////////////////////////

async function viewAllRoles() {
  const sql = `SELECT roles.id, roles.title, department.name 
              AS department, roles.salary 
              FROM roles LEFT JOIN department 
              ON roles.department_id = department.id`;
  await db
    .promise()
    .query(sql)
    .then(([rows]) => {
      console.table(rows);
    });
  await initialize();
}

async function viewAllEmployee() {
  const sql = `SELECT b.id, b.first_name, b.last_name,
  roles.title AS title, department.name AS department, roles.salary,
  IFNULL(CONCAT(a.first_name, " ", a.last_name), 'null') AS manager
    FROM employee b
    LEFT JOIN roles ON b.role_id = roles.id
    LEFT JOIN department ON roles.department_id = department.id
    LEFT JOIN employee a ON a.id = b.manager_id;`;

  await db
    .promise()
    .query(sql)
    .then(([rows]) => {
      console.table(rows);
    });
  await initialize();
  // promise(sql);
}

async function viewAllDepartments() {
  const sql = `SELECT id, name FROM department`;

  await db
    .promise()
    .query(sql)
    .then(([rows]) => {
      console.table(rows);
    });
  await initialize();
}

async function viewByManager() {
  const managerSql = `SELECT DISTINCT e.manager_id,
  IFNULL(CONCAT(a.first_name, " ", a.last_name), 'null') AS manager
  FROM employee e
  LEFT JOIN employee a ON a.id = e.manager_id
  WHERE e.manager_id IS NOT NULL`;
  const managerList = ['None'];
  await db
    .promise()
    .query(managerSql)
    .then(([result]) => {
      for (let i = 0; i < result.length; i++) {
        managerList.push({
          id: result[i].manager_id,
          name: result[i].manager,
        });
      }
    });
  await inquirer
    .prompt({
      type: 'list',
      message: 'Which Manager do you want to select to see employees?',
      name: 'choice',
      choices: managerList,
    })
    .then((answer) => {
      const values = [];
      const managerId = managerList.filter((obj) => {
        return obj.name === answer.choice;
      });
      if (answer.choice === 'None') {
        values.push('null');
      } else {
        values.push(managerId[0].name);
      }

      const sql = `SELECT b.id, b.first_name, b.last_name,
    roles.title AS title, department.name AS department, roles.salary,
    IFNULL(CONCAT(a.first_name, " ", a.last_name), 'null') AS manager
      FROM employee b
      LEFT JOIN roles ON b.role_id = roles.id
      LEFT JOIN department ON roles.department_id = department.id
      LEFT JOIN employee a ON a.id = b.manager_id
      HAVING manager = ?`;

      db.promise()
        .query(sql, values)
        .then(([rows]) => {
          console.table(rows);
          initialize();
        });
    });
}

async function viewByDepartment() {
  const deptSql = `SELECT * FROM department`;
  const deptList = [];
  await db
    .promise()
    .query(deptSql)
    .then(([result]) => {
      for (let i = 0; i < result.length; i++) {
        deptList.push({
          id: result[i].id,
          name: result[i].name,
        });
      }
    });

  await inquirer
    .prompt({
      type: 'list',
      message: 'Which department do you want to select to see employees?',
      name: 'choice',
      choices: deptList,
    })
    .then((answer) => {
      const deptId = deptList.filter((obj) => {
        return obj.name === answer.choice;
      });
      const value = [deptId[0].name];
      const sql = `SELECT b.id, b.first_name, b.last_name,
    roles.title AS title, department.name AS department, roles.salary,
    IFNULL(CONCAT(a.first_name, " ", a.last_name), 'null') AS manager
      FROM employee b
      LEFT JOIN roles ON b.role_id = roles.id
      LEFT JOIN department ON roles.department_id = department.id
      LEFT JOIN employee a ON a.id = b.manager_id
      HAVING department = ?`;

      db.promise()
        .query(sql, value)
        .then(([rows]) => {
          console.table(rows);
          initialize();
        });
    });
}

async function viewBudgetByDepartment() {
  const sql = `SELECT department_id AS id, department.name AS department,
              SUM(salary) AS budget
              FROM roles
              LEFT JOIN department on roles.department_id = department.id
              GROUP BY department.name`;

  await db
    .promise()
    .query(sql)
    .then(([rows]) => {
      console.table(rows);
    });
  await initialize();
}

//////////////////////////// Add function ///////////////////////////////

async function addDepartment() {
  await inquirer
    .prompt({
      type: 'input',
      name: 'name',
      message: 'What is the name of the department?',
      validate: (nameInput) => {
        if (nameInput) {
          return true;
        } else {
          console.log('Please enter the name!');
          return false;
        }
      },
    })
    .then((nameInput) => {
      const sql = 'INSERT INTO department (name) VALUES (?)';
      db.promise()
        .query(sql, nameInput.name)
        .then(() => {
          console.log(nameInput.name + ' added to the database');
          initialize();
        });
    });
}

async function addRole() {
  const deptSql = `SELECT * FROM department`;
  const deptList = [];
  await db
    .promise()
    .query(deptSql)
    .then(([result]) => {
      for (let i = 0; i < result.length; i++) {
        deptList.push({
          id: result[i].id,
          name: result[i].name,
        });
      }
    });

  await inquirer
    .prompt([
      {
        type: 'input',
        name: 'title',
        message: 'What is the name of the role?',
        validate: (answer) => {
          if (answer) {
            return true;
          } else {
            console.log('Please enter the name!');
            return false;
          }
        },
      },
      {
        type: 'input',
        name: 'salary',
        message: 'What is the salary of the role?',
        validate: (answer) => {
          if (answer) {
            return true;
          } else {
            console.log('Please enter the salary!');
            return false;
          }
        },
      },
      {
        type: 'list',
        message: 'Which department does the role belong to?',
        name: 'choice',
        choices: deptList,
      },
    ])
    .then((answer) => {
      const deptId = deptList.filter((obj) => {
        return obj.name === answer.choice;
      });
      const sql =
        'INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)';
      const values = [answer.title, answer.salary, deptId[0].id];
      db.promise().query(sql, values);
      console.log(answer.title + ' added to the database');
      initialize();
    });
}

async function addEmployee() {
  const roleSql = `SELECT * FROM roles`;
  const roleList = [];
  await db
    .promise()
    .query(roleSql)
    .then(([result]) => {
      for (let i = 0; i < result.length; i++) {
        roleList.push({
          id: result[i].id,
          name: result[i].title,
        });
      }
    });
  const managerSql = `SELECT DISTINCT e.manager_id,
    IFNULL(CONCAT(a.first_name, " ", a.last_name), 'null') AS manager
    FROM employee e
    LEFT JOIN employee a ON a.id = e.manager_id
    WHERE e.manager_id IS NOT NULL`;
  const managerList = ['None'];
  await db
    .promise()
    .query(managerSql)
    .then(([result]) => {
      for (let i = 0; i < result.length; i++) {
        managerList.push({
          id: result[i].manager_id,
          name: result[i].manager,
        });
      }
    });

  await inquirer
    .prompt([
      {
        type: 'input',
        name: 'first_name',
        message: "What is the employee's first name?",
        validate: (answer) => {
          if (answer) {
            return true;
          } else {
            console.log('Please enter the first name!');
            return false;
          }
        },
      },
      {
        type: 'input',
        name: 'last_name',
        message: "What is the employee's last name?",
        validate: (answer) => {
          if (answer) {
            return true;
          } else {
            console.log('Please enter the last name!');
            return false;
          }
        },
      },
      {
        type: 'list',
        message: "What is the employee's role?",
        name: 'role',
        choices: roleList,
      },
      {
        type: 'list',
        message: "Who is the employee's manager?",
        name: 'manager',
        choices: managerList,
      },
    ])
    .then((answer) => {
      const values = [];
      const roleId = roleList.filter((obj) => {
        return obj.name === answer.role;
      });
      const managerId = managerList.filter((obj) => {
        return obj.name === answer.manager;
      });
      values.push(answer.first_name, answer.last_name, roleId[0].id);
      if (answer.manager === 'None') {
        values.push(null);
      } else {
        values.push(managerId[0].id);
      }

      const sql =
        'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';

      db.promise().query(sql, values);
      console.log(
        answer.first_name + ' ' + answer.last_name + ' added to the database'
      );

      initialize();
    });
}

//////////////////////////// Update function ///////////////////////////////

async function udpateEmployeeRole() {
  const employeeSql = `SELECT a.id,
  CONCAT(a.first_name, " ", a.last_name) AS full_name
   FROM employee a`;
  const updateEmployeeList = [];
  await db
    .promise()
    .query(employeeSql)
    .then(([result]) => {
      for (let i = 0; i < result.length; i++) {
        updateEmployeeList.push({
          id: result[i].id,
          name: result[i].full_name,
        });
      }
    });

  const updateRoleSql = `SELECT * FROM roles`;
  const updateRoleList = [];
  await db
    .promise()
    .query(updateRoleSql)
    .then(([result]) => {
      for (let i = 0; i < result.length; i++) {
        updateRoleList.push({
          id: result[i].id,
          name: result[i].title,
        });
      }
    });
  await inquirer
    .prompt([
      {
        type: 'list',
        message: "Which employee's role do you want to update?",
        name: 'employee',
        choices: updateEmployeeList,
      },
      {
        type: 'list',
        message: 'Which role do you want to assign the selected employee?',
        name: 'role',
        choices: updateRoleList,
      },
    ])
    .then((answer) => {
      const employeeId = updateEmployeeList.filter((obj) => {
        return obj.name === answer.employee;
      });
      const roleId = updateRoleList.filter((obj) => {
        return obj.name === answer.role;
      });
      const values = [roleId[0].id, employeeId[0].id];
      db.promise().query(
        `
      UPDATE employee SET role_id = ? WHERE id =?`,
        values
      );
      console.log(answer.employee + "'s role updated");
      initialize();
    });
}

async function updateManager() {
  const employeeSql = `SELECT a.id,
  CONCAT(a.first_name, " ", a.last_name) AS full_name
   FROM employee a`;
  const updateEmployeeList = [];
  await db
    .promise()
    .query(employeeSql)
    .then(([result]) => {
      for (let i = 0; i < result.length; i++) {
        updateEmployeeList.push({
          id: result[i].id,
          name: result[i].full_name,
        });
      }
    });
  const managerSql = `SELECT DISTINCT e.manager_id,
    IFNULL(CONCAT(a.first_name, " ", a.last_name), 'null') AS manager
    FROM employee e
    LEFT JOIN employee a ON a.id = e.manager_id
    WHERE e.manager_id IS NOT NULL`;
  const managerList = ['None'];
  await db
    .promise()
    .query(managerSql)
    .then(([result]) => {
      for (let i = 0; i < result.length; i++) {
        managerList.push({
          id: result[i].manager_id,
          name: result[i].manager,
        });
      }
    });
  await inquirer
    .prompt([
      {
        type: 'list',
        message: "Which employee's Manager do you want to update?",
        name: 'employee',
        choices: updateEmployeeList,
      },
      {
        type: 'list',
        message: 'Which Manager do you want to assign the selected employee?',
        name: 'manager',
        choices: managerList,
      },
    ])
    .then((answer) => {
      const employeeId = updateEmployeeList.filter((obj) => {
        return obj.name === answer.employee;
      });
      const managerId = managerList.filter((obj) => {
        return obj.name === answer.manager;
      });
      const values = [];
      if (answer.manager === 'None') {
        values.push(null);
      } else {
        values.push(managerId[0].id);
      }
      values.push(employeeId[0].id);
      db.promise().query(
        `
      UPDATE employee SET manager_id = ? WHERE id =?`,
        values
      );
      console.log(answer.employee + "'s Manager updated");
      initialize();
    });
}

//////////////////////////// Delete function ///////////////////////////////

async function deleteDepart() {
  const deptSql = `SELECT * FROM department`;
  const deptList = [];
  await db
    .promise()
    .query(deptSql)
    .then(([result]) => {
      for (let i = 0; i < result.length; i++) {
        deptList.push({
          id: result[i].id,
          name: result[i].name,
        });
      }
    });

  await inquirer
    .prompt({
      type: 'list',
      message: 'Which department do you want to delete?',
      name: 'choice',
      choices: deptList,
    })
    .then((answer) => {
      const deptId = deptList.filter((obj) => {
        return obj.name === answer.choice;
      });
      const value = [deptId[0].id];
      const sql = `DELETE FROM department WHERE id = ?`;
      db.promise()
        .query(sql, value)
        .then(() => {
          console.log(answer.choice + ' department deleted');

          initialize();
        });
    });
}

async function deleteRole() {
  const roleSql = `SELECT * FROM roles`;
  const roleList = [];
  await db
    .promise()
    .query(roleSql)
    .then(([result]) => {
      for (let i = 0; i < result.length; i++) {
        roleList.push({
          id: result[i].id,
          name: result[i].title,
        });
      }
    });

  await inquirer
    .prompt({
      type: 'list',
      message: 'Which role do you want to delete?',
      name: 'choice',
      choices: roleList,
    })
    .then((answer) => {
      const roleId = roleList.filter((obj) => {
        return obj.name === answer.choice;
      });
      const value = [roleId[0].id];
      const sql = `DELETE FROM roles WHERE id = ?`;
      db.promise()
        .query(sql, value)
        .then(() => {
          console.log(answer.choice + ' role deleted');

          initialize();
        });
    });
}

async function deleteEmployee() {
  const employeeSql = `SELECT a.id,
  CONCAT(a.first_name, " ", a.last_name) AS full_name
   FROM employee a`;
  const employeeList = [];
  await db
    .promise()
    .query(employeeSql)
    .then(([result]) => {
      for (let i = 0; i < result.length; i++) {
        employeeList.push({
          id: result[i].id,
          name: result[i].full_name,
        });
      }
    });

  await inquirer
    .prompt({
      type: 'list',
      message: 'Which employee do you want to delete?',
      name: 'employee',
      choices: employeeList,
    })
    .then((answer) => {
      const employeeId = employeeList.filter((obj) => {
        return obj.name === answer.employee;
      });
      const value = [employeeId[0].id];
      const sql = `DELETE FROM employee WHERE id = ?`;
      db.promise()
        .query(sql, value)
        .then(() => {
          console.log(answer.employee + ' employee deleted');

          initialize();
        });
    });
}

//////////////////////////// Initialize function ///////////////////////////////

async function initialize() {
  await inquirer
    .prompt({
      type: 'list',
      message: 'What would you like to do?',
      name: 'choice',
      choices: [
        'View All Employees',
        'View Employees by Manager',
        'View Employees by Department',
        'Add Employee',
        'Delete Employee',
        'Update Employee Role',
        'Update Employee Manager',
        'View All Roles',
        'Add Role',
        'Delete Role',
        'View All Departments',
        'View Budget By Department',
        'Add Department',
        'Delete Department',
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
      } else if (choice === 'Add Department') {
        addDepartment();
      } else if (choice === 'Add Role') {
        addRole();
      } else if (choice === 'Add Employee') {
        addEmployee();
      } else if (choice === 'Update Employee Role') {
        udpateEmployeeRole();
      } else if (choice === 'Update Employee Manager') {
        updateManager();
      } else if (choice === 'View Employees by Manager') {
        viewByManager();
      } else if (choice === 'View Employees by Department') {
        viewByDepartment();
      } else if (choice === 'Delete Department') {
        deleteDepart();
      } else if (choice === 'Delete Role') {
        deleteRole();
      } else if (choice === 'Delete Employee') {
        deleteEmployee();
      } else if (choice === 'View Budget By Department') {
        viewBudgetByDepartment();
      } else {
        db.end();
      }
    });
}

initialize();
