const router = require("express").Router();
const auth = require("../middleware/auth");
const schemaService = require("../services/schemaService");

router
    .get("/schemas", auth, schemaService.getAll)
    .put("/schemas/:id", auth, schemaService.update)
    .put("/schemas/:id/switch", auth, schemaService.updateEnabled)
    .post("/schemas", auth, schemaService.create)
    .get("/schemas/:id", auth, schemaService.get);

module.exports = router;