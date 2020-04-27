const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ServiceInput = require("./ServiceInputModel");
ServiceOutput = require("./ServiceOutputModel");

const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    inputs: {
        type: [{ type: Schema.Types.ObjectId, ref: "serviceInput" }]
    },
    outputs: {
        type: [{ type: Schema.Types.ObjectId, ref: "serviceOutput" }]
    },
    type: {
        type: Number
    }
});

const Service = module.exports = mongoose.model("service", schema);

module.exports.get = function (callback, limit) {
    Service.find(callback).limit(limit);
};