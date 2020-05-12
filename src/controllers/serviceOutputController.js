const router = require("express").Router();
const auth = require("../middleware/auth");
const outputService = require("../services/outputService");

router
    .post("/services/add-output", auth(1), outputService.addOutputToService)
    .delete("/outputs/:id", auth(1), outputService.delete)
    .put("/outputs/update-payload", auth(1), outputService.addOutputPayload)
    .put("/outputs/update-payload-enabled", auth(1), outputService.updatePayloadEnabled)
    .put("/outputs/update-allow-empty", auth(1), outputService.updateAllowEmpty);

module.exports = router;