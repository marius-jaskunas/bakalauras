const router = require("express").Router();

const serviceGroupsController = require("./controllers/serviceGroupsController");
const authController = require("./controllers/authController");

router.use(authController);
router.use(serviceGroupsController);

module.exports = router;