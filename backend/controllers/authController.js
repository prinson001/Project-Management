const sql = require("../database/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const login = asyncHandler(async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400);
    throw new Error("email and password required");
  }

  const user = await sql`
    SELECT users.first_name , users.email,users.password , role.name  as role
    FROM users 
    JOIN role ON users.role_id = role.id 
    WHERE users.email = ${req.body.email}
    ;`;
  console.log(user);
  if (user.length == 0) {
    res.status(400);
    throw new Error("User not found");
  }
  console.log(user[0].password);
  // const match = await bcrypt.compare(req.body.password, user[0].password);
  const match = user[0].password === req.body.password;
  if (!match) {
    res.status(400);
    throw new Error("Invalid password");
  }
  const jwtToken = generatejsonWebToken(user[0]);

  res.status(200);
  res.send({
    status: "success",
    token: jwtToken,
    role: user[0].role, // Include the role in the response
  });
});

const generatejsonWebToken = (data) => {
  const { password, ...userData } = data;
  console.log(userData);
  const token = jwt.sign(
    { userData },
    process.env.JWT_SECRET,
    { expiresIn: "1h" } // Token will expire in 1 hour
  );
  return token;
};

const updateUserData = async (req, res) => {
  const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
  const hashedPassword = await bcrypt.hash("123", salt);
  const result = await sql`
    UPDATE "users" 
    SET password = ${hashedPassword}
    WHERE id = 1
  `;

  console.log(result);
  res.status(200);
  res.send({ message: result });
};

const getUsers = asyncHandler(async (req, res) => {
  const users = await sql`select * from "users"`;
  if (users.length === 0) {
    res.status(200);
    throw new Error("No users in the database");
  }
  res.status(200);
  res.json({ users });
});

const createUser = asyncHandler(async (req, res) => {
  const { email, firstname, familyname, password } = req.body;

  if (!email || !firstname || !familyname || !password) {
    res.status(400);
    res.json({
      status: "failure",
      message: "email , firstname , familyname , password required",
    });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  // 1. Validate request body
  if (!req.body.email || !req.body.currentPassword || !req.body.newPassword) {
    console.log("Missing required fields");
    return res.status(400).json({
      status: "error",
      message: "Email, current password, and new password are required",
    });
  }

  // 2. Find the user in database
  const users = await sql`
    SELECT users.id, users.email, users.password
    FROM users 
    WHERE users.email = ${req.body.email}
    ;`;

  if (users.length === 0) {
    console.log("User not found:", req.body.email);
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }

  const user = users[0];

  // 3. Verify current password
  // If using plain text comparison as in your login function
  const passwordMatch = user.password === req.body.currentPassword;

  if (!passwordMatch) {
    console.log("Incorrect password attempt");
    return res.status(400).json({
      status: "error",
      message: "Current password is incorrect",
    });
  }

  // 4. Use the new password
  const newPassword = req.body.newPassword;

  try {
    // 5. Update the password in the database
    const result = await sql`
      UPDATE users 
      SET password = ${newPassword}
      WHERE id = ${user.id}
    `;

    // 6. Return success response
    if (result.count > 0) {
      console.log("Password updated successfully for user:", user.email);
      return res.status(200).json({
        status: "success",
        message: "Password updated successfully",
      });
    } else {
      console.log("Database update returned 0 affected rows");
      return res.status(500).json({
        status: "error",
        message: "Failed to update password",
      });
    }
  } catch (error) {
    console.error("Database error during password update:", error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while updating the password",
      details: error.message,
    });
  }
});

module.exports = { login, updateUserData, getUsers, resetPassword };
