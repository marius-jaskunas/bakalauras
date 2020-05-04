const router = require("express").Router();
const auth = require("../middleware/auth");
const outputService = require("../services/outputService");

router
    .post("/services/add-output", auth, outputService.addOutputToService)
    .put("/outputs/update-payload", auth, outputService.addOutputPayload)
    .put("/outputs/update-payload-enabled", auth, outputService.updatePayloadEnabled)
    .put("/outputs/update-allow-empty", auth, outputService.updateAllowEmpty);

module.exports = router;