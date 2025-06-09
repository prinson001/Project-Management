const express = require("express");
const router = express.Router();
const {getSubFilters , getMainFilters , addMeetingNotes , createMeeting , getPreviousMeetingNotes,getProjects } = require("../controllers/meetingController");

router.get("/main-filters",getMainFilters);
router.get("/sub-filters/:type",getSubFilters);
router.post("/meeting",createMeeting);
router.post("/add-meeting-notes",addMeetingNotes);
router.get("/previous-meeting-notes",getPreviousMeetingNotes);
router.get("/projects",getProjects)

module.exports =  router