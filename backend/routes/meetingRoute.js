const express = require("express");
const router = express.Router();
const {getSubFilters , getMainFilters , addMeetingNotes } = require("../controllers/meetingController");

router.get("/main-filters",getMainFilters);
router.get("/sub-filters/:type",getSubFilters);
router.post("/add-meeting-notes",addMeetingNotes);

module.exports =  router