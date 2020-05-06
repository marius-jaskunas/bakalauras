const router = require("express").Router();

const serviceGroupsController = require("./controllers/serviceGroupsController");
const authController = require("./controllers/authController");
const serviceController = require("./controllers/serviceController");
const serviceOutputController = require("./controllers/serviceOutputController");
const serviceInputController = require("./controllers/serviceInputController");
const schemaController = require("./controllers/schemaController");
const eventsController = require("./controllers/eventsController");

router.use(authController);
router.use(serviceGroupsController);
router.use(serviceController);
router.use(serviceOutputController);
router.use(serviceInputController);
router.use(schemaController);
router.use(eventsController);

module.exports = router;