const router = require("express").Router();
const auth = require("../middleware/auth");
const serviceService = require("../services/serviceService");


router
    .post("/service-groups/add-service", auth(1), serviceService.addService)
    .get("/services/:id", auth(), serviceService.getService)
    .delete("/services/:id", auth(1), serviceService.delete);

module.exports = router;