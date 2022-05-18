-- SELECT roles.id, roles.title, department.name 
--     AS department, roles.salary 
--     FROM roles LEFT JOIN department 
--     ON roles.department_id = department.id

SELECT b.id, b.first_name, b.last_name,
       roles.title AS title, department.name AS department, roles.salary,
       IFNULL(CONCAT(a.first_name, " ", a.last_name), 'null') AS manager
    FROM employee b
    LEFT JOIN roles ON b.role_id = roles.id
    LEFT JOIN department ON roles.department_id = department.id
    LEFT JOIN employee a ON a.id = b.manager_id;


-- SELECT b.*, IFNULL(CONCAT(a.last_name, " ", a.first_name), 'null') AS manager
--        FROM employee b
--        LEFT JOIN employee a ON a.id = b.manager_id;