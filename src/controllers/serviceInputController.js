const router = require("express").Router();
const auth = require("../middleware/auth");
const inputService = require("../services/inputService");

router
    .post("/services/add-input", auth, inputService.addInputToService)
    .put("/inputs/update-payload", auth, inputService.addInputPayload)
    .put("/inputs/update-payload-enabled", auth, inputService.updatePayloadEnabled)
    .put("/inputs/update-connection-details", auth, inputService.updateConnectionDetails)
    .put("/inputs/update-allow-empty", auth, inputService.updateAllowEmpty);

module.exports = router;