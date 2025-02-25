const dotenv = require("dotenv").config();
const sql = require("../database/db");
const jwt = require("jsonwebtoken");
const verifyToken = async (req, res, next) => {
  try {
    console.log(req.headers);
    if (!req.headers.authorization) {
      res.status(400);
      throw new Error("Authorization token missing");
    }
    if (!req.headers.authorization.startsWith("Bearer")) {
      res.status(400);
      throw new Error("token missing");
    }
    const token = req.headers.authorization.split(" ")[1];
    console.log("the token", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded", decoded);
    req.userData =
      await sql`select * from "User" where id = ${decoded.data.id}`;
    console.log(req.userData);
    next();
  } catch (e) {
    res.status(400);
    throw new Error("Unauthorized access");
  }
};

module.exports = { verifyToken };
