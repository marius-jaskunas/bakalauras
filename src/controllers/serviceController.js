const router = require("express").Router();
const auth = require("../middleware/auth");
const serviceService = require("../services/serviceService");


router
    .post("/service-groups/add-service", auth, serviceService.addService)
    .get("/services/:id", auth, serviceService.getService);

module.exports = router;