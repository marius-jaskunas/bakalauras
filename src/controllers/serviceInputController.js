const router = require("express").Router();
const auth = require("../middleware/auth");
const inputService = require("../services/inputService");

router
    .post("/services/add-input", auth(1), inputService.addInputToService)
    .delete("/inputs/:id", auth(1), inputService.delete)
    .put("/inputs/update-payload", auth(1), inputService.addInputPayload)
    .put("/inputs/update-payload-enabled", auth(1), inputService.updatePayloadEnabled)
    .put("/inputs/update-connection-details", auth(1), inputService.updateConnectionDetails)
    .put("/inputs/update-allow-empty", auth(1), inputService.updateAllowEmpty);

module.exports = router;