const express = require("express");

const errorHandler = (err, req, res, next) => {
  console.error("Error handled by errorHandler middleware:", err); // Log the full error

  const status = err.status || err.statusCode || 500;

  // Check if headers have already been sent
  if (res.headersSent) {
    console.error("Headers already sent, cannot send error response to client. Delegating to default Express handler.");
    // If headers are sent, it's too late to send a new response.
    // We should delegate to the built-in Express error handler.
    // In newer Express versions, this might happen automatically if we call next(err)
    // but for a final handler, it's often better to just log and ensure the process doesn't crash.
    // For now, we'll just return to prevent further processing in this handler.
    return next(err); // Pass to default Express error handler if headers sent
  }

  res.status(status).json({
    message: err.message,
    // Only send stack in development for security reasons
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
  // DO NOT call next() here if you've sent a response.
};

module.exports = errorHandler;
