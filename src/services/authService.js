const { User, validate } = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const Roles = require("../enums/roles");
const ResponseManager = require("./responseManager");
const MapUser = require("../mappers/MapUser");
const config = require("config");

exports.register = async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        return res.status(400).send(ResponseManager.errorMessage(error.details[0].message));
    }

    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).send(ResponseManager.errorMessage("User already registered."));
    }

    user = new User({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
        role: Roles.Admin
    });
    user.password = await bcrypt.hashSync(user.password, 10);
    await user.save();

    const token = user.generateAuthToken();
    return res.cookie("authToken", token, {
        expires: new Date(Date.now() + config.get("authExpiration") * 60 * 1000),
        secure: false, // set to true if your using https
        httpOnly: true,
    }).send(ResponseManager.successMessage("Successfully registered", MapUser(user)));
};

exports.changePassword = function (req, res) {
    const body = req.body;
    User.findById(req.params.id, async  (err, user) => {
        const match = await bcrypt.compareSync(body.oldPassword, user.password);

        if (!match) {
            return res.status(400).send(ResponseManager.errorMessage("Incorrect user password"));
        }

        user.password = await bcrypt.hashSync(body.newPassword, 10);
        try {
            await user.save();
        }
        catch (error) {
            return res.status(400).send(ResponseManager.errorMessage(error));
        }
        res.send(ResponseManager.successMessage("User password has been updated"));
    });
};

exports.delete = function (req, res) {
    User.findByIdAndDelete(req.params.id, async  (err) => {
        if (err) {
            return res.status(400).send(ResponseManager.errorMessage(err));
        }
        res.send(ResponseManager.successMessage("User has been deleted"));
    });
};

exports.getUsers = function (req, res) {
    User
        .find()
        .exec(function (err, schemas) {
            if (err) {
                return res.status(400).send(ResponseManager.errorMessage(err));
            }
            res.send(ResponseManager.successMessage(
                "Users retrieved successfully.",
                schemas.map(x => MapUser(x))
            ));
        });
};


exports.createUser = async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        return res.status(400).send(ResponseManager.errorMessage(error.details[0].message));
    }

    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).send(ResponseManager.errorMessage("User already registered."));
    }

    user = new User({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
        role: req.body.role
    });
    user.password = await bcrypt.hashSync(user.password, 10);
    await user.save();

    return res.send(ResponseManager.successMessage("User successfully created"));
};

exports.login = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(400).send(ResponseManager.errorMessage("Invalid credentials."));
    }

    const match = await bcrypt.compareSync(req.body.password, user.password);

    if (match) {
        const token = user.generateAuthToken();
        return res.cookie("authToken", token, {
            expires: new Date(Date.now() + config.get("authExpiration") * 60 * 1000),
            secure: false, // set to true if your using https
            httpOnly: true,
        }).send(ResponseManager.successMessage("Successfully authenticated.", MapUser(user)));
    }
    
    return res.status(400).send(ResponseManager.errorMessage("Invalid credentials."));
};

exports.permissions = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    res.send(ResponseManager.successMessage("Permissions retrieved successfully.", MapUser(user)));
};