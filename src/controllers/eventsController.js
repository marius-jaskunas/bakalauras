const router = require("express").Router();
const eventService = require("../services/eventService");

router
    .post("/events/:schemaId/:serviceId/output/:eventName", eventService.handleEvent);

module.exports = router;