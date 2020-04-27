const router = require("express").Router();
const auth = require("../middleware/auth");
const serviceGroupService = require("../services/serviceGroupService");

router
    .get("/service-groups", auth, serviceGroupService.getAll)
    .post("/service-groups", auth, serviceGroupService.create)
    .get("/service-groups/:id", auth, serviceGroupService.getGroup);

router
    .post("/service-groups/add-service", auth, serviceGroupService.addService);

router
    .post("/services/add-input", auth, serviceGroupService.addInputToService)
    .post("/services/add-output", auth, serviceGroupService.addOutputToService)
    .get("/services/:id", auth, serviceGroupService.getService);

module.exports = router;