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

const ServiceOutput = module.exports = mongoose.model("serviceOutput", schema);

module.exports.get = function (callback, limit) {
    ServiceOutput.find(callback).limit(limit);
};