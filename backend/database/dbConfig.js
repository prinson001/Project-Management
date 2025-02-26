const sql = require("./db");

const createUsersTable = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        family_name VARCHAR(100),
        arabic_first_name VARCHAR(100),
        arabic_family_name VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    console.log(result);
    res.status(200);
    res.json({ status: "success", result });
  } catch (e) {
    res.status(500);
    throw new Error(`Error in creating table user ${e}`);
  }
};

const createInitiativeTable = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE initiative (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT ,
        arabic_name VARCHAR(255) , 
        arabic_description TEXT ,   
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    console.log(result);
    res.status(200);
    res.json({ status: "success", result });
  } catch (e) {
    res.status(200);
    throw new Error(`error in creating Initiative table`);
  }
};

const createDepartmentTable = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE department (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        arabic_name VARCHAR(255) NOT NULL
    )`;
    console.log(result);
    res.status(200);
    res.json({ status: "success", result });
  } catch (e) {
    res.status(500);
    throw new Error("Error in creating department table");
  }
};

const createObjectiveTable = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE objective(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        description TEXT,
        arabic_name VARCHAR(255),
        arabic_description TEXT
    )`;
    res.status(200);
    res.json({ status: "success", result });
  } catch (e) {
    res.status(500);
    throw new Error("Error in creating objective table");
  }
};

const createVendorTable = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE vendor(
          id SERIAL PRIMARY KEY,
          name VARCHAR(255),
          arabic_name VARCHAR(255)
      )`;
    res.status(200);
    res.json({ status: "success", result });
  } catch (e) {
    res.status(500);
    throw new Error(`Error in creating vendor table ${e}`);
  }
};

const createTableRole = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE role (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL 
    )`;
    res.status(200);
    res.json({ status: "success", result });
  } catch (e) {
    res.status(500);
    throw new Error("Error creating role table");
  }
};

module.exports = {
  createUsersTable,
  createInitiativeTable,
  createDepartmentTable,
  createObjectiveTable,
  createVendorTable,
  createTableRole,
};
