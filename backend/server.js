require("dotenv").config();
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const cronJob = require("./services/cronJob");

const app = express();
console.log(process.env.PORT);
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", require("./routes/authRoute"));
app.use("/admin", require("./routes/adminRoute"));
app.use("/db", require("./routes/tempdbConfigRoute"));
app.use("/data-management", require("./routes/dataManagementRoute"));
app.use("/pm", require("./routes/pmRoute"));
app.use("/tasks", require("./routes/tasksRoute"));

//Error handler middleware to handle and structure the errror
app.use(errorHandler);

app.listen(port, (req, res) => {
  console.log(`App listening at port ${port}`);
  cronJob();
});
// process.on("SIGINT", () => {
//   console.log("Shutting down server gracefully...");
//   server.close(() => {
//     console.log("Server closed. Exiting process...");
//     process.exit(0);
//   });
// });

// process.on("SIGTERM", () => {
//   console.log("Process terminated.");
//   server.close(() => process.exit(0));
// });
