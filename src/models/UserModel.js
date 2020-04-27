const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");
const Roles = require("../enums/roles");

const schema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255
    },
    role: {
        type: Number,
        required: true
    }
});

schema.methods.generateAuthToken = function() {
    //get the private key from the config file -> environment variable
    return jwt.sign({id: this._id, role: this.role}, config.get("authKey"), {
        expiresIn: config.get("authExpiration") * 60
    });
};

const User = mongoose.model("user", schema);

function validateUser(user) {
    const schema = {
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(3).max(255).required(),
        role: Joi.allow(Object.values(Roles)).required()
    };

    return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;