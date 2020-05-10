const router = require("express").Router();
const auth = require("../middleware/auth");
const schemaService = require("../services/schemaService");

router
    .get("/schemas", auth, schemaService.getAll)
    .put("/schemas/:id", auth, schemaService.updateSchemaData)
    .put("/schemas/:id/switch", auth, schemaService.updateEnabledFlag)
    .post("/schemas", auth, schemaService.create)
    .get("/schemas/:id", auth, schemaService.get)
    .delete("/schemas/:id", auth, schemaService.delete);

module.exports = router;