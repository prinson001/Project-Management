const sql = require("../database/db");
const addNewUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error("Required field missing");
  }
  const users = await sql`select * from "User" where email = ${email}`;
  if (users.length != 0) {
    res.status(400);
    throw new Error("Email already exists");
  }
  try {
    const result =
      await sql`insert into "User" (email , password) values(${email} , ${password})`;
  } catch (e) {
    res.status(400);
    throw new Error("there was an error in inserting table ", e);
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await sql`select id , email from "User"`;
    res.status(200);
    res.json({ result: users });
  } catch (e) {
    res.status(500);
    throw new Error("Error in getting users ", e);
  }
};

const deleteUsers = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await sql`DELETE FROM "User" WHERE id = ${id} RETURNING *`;
    res.status(200);
    console.log(result);
    res.json({ status: "success", message: result });
  } catch (e) {
    res.status(500);
    throw new Error("there was an error", e);
  }
};

module.exports = { addNewUser, getUsers, deleteUsers };
