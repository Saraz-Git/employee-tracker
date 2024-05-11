# PostgreSQL Employee Tracker

## Description

This command-line application is a content management system for managing a company's employee database, using Node.js, Inquirer, and PostgreSQL. 

## Table of Contents 

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Review](#review)

## Installation

To clone and run this repository you'll need Git, PostgreSQL and Node.js (which comes with npm) installed on your computer. From your command line:
```
# Go into the repository
cd employee-tracker

# Go into the db folder
cd db

# Use PostgreSQL 
psql -U postgres

# Create database and tables
\i schema.sql

# Seed the database with test data
\i seeds.sql
```
Fill in database name, your PostgreSQL username, and your PostgreSQL password in the environment varible file to set up the connection to database. Then install dependencies by ```npm i```.

## Usage

The application will be invoked by ```npm start``` .The following video shows an example of the application being used from the command line:

https://www.loom.com/share/986eeb5ffa5d4c9589bd2e9bdef4c400

## Features

Main functionality of the application as the following:

* View All Employees
* View All departments
* View All Roles
* Add Department
* Add Role
* Add Employee
* Update Employee Role

Additional functionality:

* View Employee By Department
* View the total utilized budget of a department&mdash;in other words, the combined salaries of all employees in that department

## Review

* Walkthrough demo video: [video](https://www.loom.com/share/986eeb5ffa5d4c9589bd2e9bdef4c400)

* The URL of the GitHub repository: https://github.com/Saraz-Git/employee-tracker


