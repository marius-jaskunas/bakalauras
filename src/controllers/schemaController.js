const router = require("express").Router();
const auth = require("../middleware/auth");
const schemaService = require("../services/schemaService");

router
    .get("/schemas", auth(), schemaService.getAll)
    .put("/schemas/:id", auth(1), schemaService.updateSchemaData)
    .put("/schemas/:id/switch", auth(1), schemaService.updateEnabledFlag)
    .post("/schemas", auth(1), schemaService.create)
    .get("/schemas/:id", auth, schemaService.get)
    .delete("/schemas/:id", auth(1), schemaService.delete);

module.exports = router;