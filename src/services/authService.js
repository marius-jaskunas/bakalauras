const { User, validate } = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const Roles = require("../enums/roles");
const ResponseManager = require("./responseManager");
const MapUser = require("../mappers/MapUser");
const config = require("config");

exports.register = async (req, res) => {
    try {
        const {error} = validate(req.body);
        if (error) {
            return res.status(400).send(ResponseManager.errorMessage(error.details[0].message));
        }

        let user = await User.findOne({email: req.body.email});
        if (user) {
            return res.status(400).send(ResponseManager.errorMessage("User already registered."));
        }

        user = new User({
            name: req.body.name,
            password: req.body.password,
            email: req.body.email,
            role: Roles.Admin
        });
        user.password = await bcrypt.hash(user.password, 10);
        await user.save();

        const token = user.generateAuthToken();
        return res.cookie("authToken", token, {
            expires: new Date(Date.now() + config.get("authExpiration") * 60 * 1000),
            secure: false, // set to true if your using https
            httpOnly: true,
        }).send(ResponseManager.successMessage("Successfully registered", MapUser(user)));
    } catch (e) {
        return res.status(500).send(ResponseManager.errorMessage(e));
    }
};

exports.changePassword = function (req, res) {
    const body = req.body;
    User.findById(req.params.id, async  (err, user) => {
        try {
            const match = await bcrypt.compare(body.oldPassword, user.password);

            if (!match) {
                return res.status(400).send(ResponseManager.errorMessage("Incorrect user password"));
            }

            user.password = await bcrypt.hash(body.newPassword, 10);
            try {
                await user.save();
            } catch (error) {
                return res.status(400).send(ResponseManager.errorMessage(error));
            }
            res.send(ResponseManager.successMessage("User password has been updated"));
        } catch (e) {
            return res.status(500).send(ResponseManager.errorMessage(e));
        }
    });
};

exports.delete = function (req, res) {
    try {
        User.findByIdAndDelete(req.params.id, async (err) => {
            if (err) {
                return res.status(400).send(ResponseManager.errorMessage(err));
            }
            res.send(ResponseManager.successMessage("User has been deleted"));
        });
    } catch (e) {
        return res.status(500).send(ResponseManager.errorMessage(e));
    }
};

exports.getUsers = function (req, res) {
    User
        .find()
        .exec(function (err, schemas) {
            try {
                if (err) {
                    return res.status(400).send(ResponseManager.errorMessage(err));
                }
                res.send(ResponseManager.successMessage(
                    "Users retrieved successfully.",
                    schemas.map(x => MapUser(x))
                ));
            } catch (e) {
                return res.status(500).send(ResponseManager.errorMessage(e));
            }
        });
};


exports.createUser = async (req, res) => {
    try {
        const {error} = validate(req.body);
        if (error) {
            return res.status(400).send(ResponseManager.errorMessage(error.details[0].message));
        }

        let user = await User.findOne({email: req.body.email});
        if (user) {
            return res.status(400).send(ResponseManager.errorMessage("User already registered."));
        }

        user = new User({
            name: req.body.name,
            password: req.body.password,
            email: req.body.email,
            role: req.body.role
        });
        user.password = await bcrypt.hash(user.password, 10);
        await user.save();

        return res.send(ResponseManager.successMessage("User successfully created"));
    } catch (e) {
        return res.status(500).send(ResponseManager.errorMessage(e));
    }
};

exports.login = async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email});

        if (!user) {
            return res.status(400).send(ResponseManager.errorMessage("Invalid credentials."));
        }

        const match = await bcrypt.compare(req.body.password, user.password);

        if (match) {
            const token = user.generateAuthToken();
            return res.cookie("authToken", token, {
                expires: new Date(Date.now() + config.get("authExpiration") * 60 * 1000),
                secure: false, // set to true if your using https
                httpOnly: true,
            }).send(ResponseManager.successMessage("Successfully authenticated.", MapUser(user)));
        }

        return res.status(400).send(ResponseManager.errorMessage("Invalid credentials."));
    } catch (e) {
        return res.status(500).send(ResponseManager.errorMessage(e));
    }
};

exports.permissions = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(401).send(ResponseManager.errorMessage("User is not authorized."));
        }
        res.send(ResponseManager.successMessage("Permissions retrieved successfully.", MapUser(user)));
    } catch (e) {
        return res.status(500).send(ResponseManager.errorMessage(e));
    }
};
