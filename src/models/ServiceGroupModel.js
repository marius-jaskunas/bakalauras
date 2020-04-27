const mongoose = require("mongoose");
const Schema = mongoose.Schema;
Service = require("./ServiceModel");

const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    services: {
        type: [{ type: Schema.Types.ObjectId, ref: "service" }]
    }
});

const ServiceGroup = module.exports = mongoose.model("serviceGroup", schema);

module.exports.get = function (callback, limit) {
    ServiceGroup.find(callback).limit(limit);
};