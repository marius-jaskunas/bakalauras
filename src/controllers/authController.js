const router = require("express").Router();
const auth = require("../middleware/auth");
const authService = require("../services/authService");

router
    .post("/register", authService.register)
    .get ("/permissions", auth(), authService.permissions)
    .get("/users", authService.getUsers)
    .post("/users", authService.createUser)
    .put("/users/:id", authService.changePassword)
    .delete("/users/:id", authService.delete)
    .post("/login", authService.login);

module.exports = router;