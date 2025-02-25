require("dotenv").config();
const express = require("express");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
console.log(process.env.PORT);
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", require("./routes/authRoute"));

//Error handler middleware to handle and structure the errror
app.use(errorHandler);

app.listen(port, (req, res) => {
  console.log(`App listening at port ${port}`);
});
