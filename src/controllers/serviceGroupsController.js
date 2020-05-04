const router = require("express").Router();
const auth = require("../middleware/auth");
const serviceGroupService = require("../services/serviceGroupService");

router
    .get("/service-groups", auth, serviceGroupService.getAll)
    .post("/service-groups", auth, serviceGroupService.create)
    .get("/service-groups/:id", auth, serviceGroupService.getGroup);

module.exports = router;