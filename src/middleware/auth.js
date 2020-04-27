const jwt = require("jsonwebtoken");
const config = require("config");
const ResponseManager = require("../services/responseManager");

module.exports = function(req, res, next) {
    //get the token from the header if present
    const token = req.cookies.authToken || "";
    //if no token found, return response (without going to the next middelware)
    if (!token) {
        return res.status(401).send(ResponseManager.errorMessage("Access denied. No token provided."));
    }

    try {
        //if can verify the token, set req.user and pass to next middleware
        req.user = jwt.verify(token, config.get("authKey"));
        next();
    } catch (ex) {
        if (ex.name === "TokenExpiredError") {
            return res.status(400).send(ResponseManager.errorMessage("Token is expired."));
        }
        return res.status(400).send(ResponseManager.errorMessage("The provided token is invalid."));
    }
};