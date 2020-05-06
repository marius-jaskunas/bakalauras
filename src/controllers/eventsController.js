const router = require("express").Router();
const auth = require("../middleware/auth");
const eventService = require("../services/eventService");

router
    .post("/events/:schemaId/:serviceId/output/:eventName", auth, eventService.handleEvent);

module.exports = router;