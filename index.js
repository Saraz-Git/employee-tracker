// Include packages needed for this application
require('dotenv').config();
const inquirer = require("inquirer");
const { Pool } = require('pg');
const figlet = require("figlet");
const colors = require('colors');

//Connect to database
const pool = new Pool(
    {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: 'localhost',
        database: process.env.DB_NAME
    },
)
//Create a function to initialize app
const init = async () => {
    try {
        ascii = await figlet("Employee Tracker");
        console.log(colors.grey(ascii));

        let stop = false;
        while (!stop) {
            const answer = await inquirer.prompt([{
                type: 'list',
                message: 'What would you like to do?',
                name: 'task',
                choices: ['View All Employees', 'View Employee By Department', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'View Department Budget', 'Quit'],
                pageSize: 5,
            }]);

            //App respond to user choices
            if (answer.task === 'Quit') { stop = true; };
            if (answer.task === 'View All Employees') {
                const response = await pool.query(`SELECT employee.id,employee.first_name,employee.last_name,role.title,department.name AS department,role.salary,e.first_name||' '||e.last_name AS manager FROM employee LEFT JOIN employee e ON employee.manager_id=e.id JOIN role ON employee.role_id = role.id JOIN department ON role.department = department.id`);
                console.table(response.rows);
            };

            if (answer.task === 'View All Roles') {
                const response = await pool.query('SELECT role.id,role.title,role.salary,department.name AS department FROM role JOIN department ON role.department = department.id');
                console.table(response.rows);
            };

            if (answer.task === 'View All Departments') {
                const response = await pool.query('SELECT * FROM department');
                console.table(response.rows);
            };

            if (answer.task === 'View Department Budget') {
                const response = await pool.query(`SELECT department.name AS department,SUM(role.salary) AS budget FROM employee LEFT JOIN employee e ON employee.manager_id=e.id JOIN role ON employee.role_id = role.id JOIN department ON role.department = department.id GROUP BY department.name`);
                console.table(response.rows);
            };

            if (answer.task === 'Add Department') {
                const response = await pool.query('SELECT name FROM department');
                const deptArray = (response.rows).map(el => el.name);
                const questions = [
                    {
                        type: 'input',
                        name: 'name',
                        message: 'What is the name of the department?',
                    }
                ];
                const answer = await inquirer.prompt(questions);

                if (!deptArray.includes(answer.name)) {
                    await pool.query(`INSERT INTO department (name) VALUES ($1)`, [answer.name]);
                    console.log(colors.grey(`Added ${answer.name} to the database`));
                };
            };

            if (answer.task === 'Add Role') {
                const response = await pool.query('SELECT name FROM department');
                const deptArray = (response.rows).map(el => el.name);
                const questions = [
                    {
                        type: 'input',
                        name: 'title',
                        message: 'What is the name of the role?',
                    },
                    {
                        type: 'input',
                        name: 'salary',
                        message: 'What is the salary of the role?',
                    },
                    {
                        type: 'list',
                        name: 'department',
                        message: 'Which department does the role belong to?',
                        choices: deptArray,
                        pageSize: 5,
                    }
                ];
                const answer = await inquirer.prompt(questions);
                const result = await pool.query('SELECT department.id FROM department WHERE department.name = $1', [answer.department]);
                const departmentId = parseInt((result.rows)[0].id);
                await pool.query(`INSERT INTO role (title,salary,department) VALUES ($1,$2,$3)`, [answer.title, answer.salary, departmentId]);
                console.log(colors.grey(`Added ${answer.title} to the database`));
            };

            if (answer.task === 'Add Employee') {
                const response = await pool.query('SELECT title FROM role');
                const roleArray = (response.rows).map(el => el.title);
                const result = await pool.query(`SELECT id,first_name || ' ' || last_name AS fullname FROM employee ORDER BY id ASC`);
                const employeeArray = (result.rows).map(el => el.fullname);
                employeeArray.push('None');

                const questions = [
                    {
                        type: 'input',
                        name: 'firstname',
                        message: `What is the the employee's first name?`,
                    },
                    {
                        type: 'input',
                        name: 'lastname',
                        message: `What is the employee's last name?`,
                    },
                    {
                        type: 'list',
                        name: 'role',
                        message: `What is the employee's role?`,
                        choices: roleArray,
                        pageSize: 5,
                    },
                    {
                        type: 'list',
                        name: 'manager',
                        message: 'Who is the manager of the employee?',
                        choices: employeeArray,
                        pageSize: 5,
                    },
                ];
                const answer = await inquirer.prompt(questions);
                const reply = await pool.query('SELECT role.id FROM role where role.title = $1', [answer.role]);
                const roleid = parseInt((reply.rows)[0].id);
                let managerid;
                if (answer.manager !== 'None') {
                    const reaction = await pool.query(`SELECT employee.id FROM employee WHERE employee.first_name || ' ' || employee.last_name = $1`, [answer.manager]);
                    managerid = parseInt((reaction.rows)[0].id)
                } else { managerid = null };

                await pool.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1,$2,$3,$4)`, [answer.firstname, answer.lastname, roleid, managerid]);
                console.log(colors.grey(`Added ${answer.firstname} ${answer.lastname} to the database`));
            };

            if (answer.task === 'View Employee By Department') {
                const response = await pool.query('SELECT name FROM department');
                const deptArray = (response.rows).map(el => el.name);
                const questions = [
                    {
                        type: 'list',
                        name: 'department',
                        message: 'Which department do you want to choose?',
                        choices: deptArray,
                        pageSize: 5,
                    }
                ];
                const answer = await inquirer.prompt(questions);
                console.log(answer.department);
                const result = await pool.query(`SELECT department.name AS department,employee.first_name||' '||employee.last_name AS full_name FROM employee LEFT JOIN employee e ON employee.manager_id=e.id JOIN role ON employee.role_id = role.id JOIN department ON role.department = department.id WHERE department.name = $1`, [answer.department]);
                console.table(result.rows);
            };

            if (answer.task === 'Update Employee Role') {
                const response = await pool.query('SELECT title FROM role');
                const roleArray = (response.rows).map(el => el.title);
                const result = await pool.query(`SELECT id,first_name || ' ' || last_name AS fullname FROM employee ORDER BY id ASC`);
                const employeeArray = (result.rows).map(el => el.fullname);
                const questions = [
                    {
                        type: 'list',
                        name: 'name',
                        message: "Which employee's role do you want to update?",
                        choices: employeeArray,
                        pageSize: 5,
                    },
                    {
                        type: 'list',
                        name: 'role',
                        message: 'Which role do you want to assign the selected employee?',
                        choices: roleArray,
                        pageSize: 5,
                    }
                ];
                const answer = await inquirer.prompt(questions);
                const reply = await pool.query('SELECT role.id FROM role where role.title = $1', [answer.role]);
                const roleid = parseInt((reply.rows)[0].id);
                const reaction = await pool.query(`SELECT employee.id FROM employee WHERE employee.first_name || ' ' || employee.last_name = $1`, [answer.name]);
                const employeeid = parseInt((reaction.rows)[0].id);
                await pool.query(`UPDATE employee SET role_id = $1 WHERE id = $2`, [roleid, employeeid]);
            };
        }
    } catch (err) {
        console.log(err);
    }
};

// Function call to initialize app
init();