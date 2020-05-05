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

exports.generate = async (req, res) => {
    const user = new User({
        name: "admin",
        password: "admin123",
        email: "admin@test.com",
        role: Roles.Admin
    });
    user.password = await bcrypt.hashSync(user.password, 10);
    await user.save();

    const token = user.generateAuthToken();
    return res.cookie("authToken", token, {
        expires: new Date(Date.now() + config.get("authExpiration") * 60 * 1000),
        sameSite: "None",
        secure: false, // set to true if your using https
        httpOnly: true,
    }).send(ResponseManager.successMessage("Successfully registered", MapUser(user)));
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