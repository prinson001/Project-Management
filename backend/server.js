require("dotenv").config();
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const cronJob = require("./services/cronJob");
const multer = require("multer");

const app = express();
console.log(process.env.PORT);
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const upload = multer();

app.use("/auth", require("./routes/authRoute"));
app.use("/admin", require("./routes/adminRoute"));
app.use("/db", require("./routes/tempdbConfigRoute"));
app.use("/data-management", require("./routes/dataManagementRoute"));
app.use("/pm", require("./routes/pmRoute"));
app.use("/tasks", require("./routes/tasksRoute"));
app.use("/deputy", require("./routes/deputyRoute"));
app.use("/meeting", require("./routes/meetingRoute"));

app.post(
  "/data-management/addProjectDocument",
  upload.single("file"),
  require("./controllers/documentController").addProjectDocument
);

app.use(errorHandler);

app.listen(port, (req, res) => {
  console.log(`App listening at port ${port}`);
  cronJob();
});
process.on("SIGINT", () => {
  console.log("Shutting down server gracefully...");
  app.close(() => {
    console.log("Server closed. Exiting process...");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("Process terminated.");
  app.close(() => process.exit(0));
});
