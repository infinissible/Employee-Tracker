DROP TABLE IF EXISTS employee;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS department;


CREATE TABLE department (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE roles (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) NOT NULL, 
    salary DECIMAL(10),   
    department_id INTEGER,    
    CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE CASCADE
);

CREATE TABLE employee (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INTEGER,
    manager_id INTEGER NULL,
    CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
    CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES employee(id) ON DELETE SET NULL
);
