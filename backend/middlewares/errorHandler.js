const express = require("express");

const errorHandler = (err, req, res, next) => {
  const status = res.statusCode || 500;
  console.log("error handler called");
  res.status(status);
  res.json({
    message: err.message,
    stack: err.stack,
  });
  next();
};

module.exports = errorHandler;
