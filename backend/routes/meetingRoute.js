const express = require("express");
const router = express.Router();
const {getSubFilters , getMainFilters } = require("../controllers/meetingController");

router.get("/main-filters",getMainFilters);
router.get("/sub-filters/:type",getSubFilters);

module.exports =  router