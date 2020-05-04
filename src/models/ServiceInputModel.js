const mongoose = require("mongoose");

const schema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    allowEmpty: {
        type: Boolean,
        required: true
    },
    url: {
        type: String
    },
    apiKey: {
        type: String
    },
    payloadEnabled: {
        type: Boolean,
        required: true
    },
    payload: {
        type: Array,
        required: false
    },
    parsedPayload: {
        type: Object,
        required: false
    },
});

const ServiceInput = module.exports = mongoose.model("serviceInput", schema);

module.exports.get = function (callback, limit) {
    ServiceInput.find(callback).limit(limit);
};