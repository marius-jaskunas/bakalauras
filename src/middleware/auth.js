const jwt = require("jsonwebtoken");
const config = require("config");
const ResponseManager = require("../services/responseManager");

module.exports = function(role) {
    return function(req, res, next) {
        //get the token from the header if present
        const token = req.cookies.authToken || "";
        //if no token found, return response (without going to the next middleware)
        if (!token) {
            return res.status(401).send(ResponseManager.errorMessage("Access denied. No token provided."));
        }

        try {
            //if can verify the token, set req.user and pass to next middleware
            req.user = jwt.verify(token, config.get("authKey"));

            if (role && req.user.role !== role) {
                return res.status(403).send(ResponseManager.errorMessage("User does not have permission to access this action."));
            }
            next();
        } catch (ex) {
            if (ex.name === "TokenExpiredError") {
                return res.status(401).send(ResponseManager.errorMessage("Token is expired."));
            }
            return res.status(401).send(ResponseManager.errorMessage("The provided token is invalid."));
        }
    };
};