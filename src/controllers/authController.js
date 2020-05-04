const router = require("express").Router();
const auth = require("../middleware/auth");
const authService = require("../services/authService");

router
    .post("/register", authService.register)
    .get ("/permissions", auth, authService.permissions)
    .get("/generate", authService.generate)
    .post("/login", authService.login);

module.exports = router;