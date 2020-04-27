const mongoose = require("mongoose");

const schema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    isSynchronous: {
        type: Boolean,
        required: true
    },
    allowEmpty: {
        type: Boolean,
        required: true
    }
});

const ServiceInput = module.exports = mongoose.model("serviceInput", schema);

module.exports.get = function (callback, limit) {
    ServiceInput.find(callback).limit(limit);
};