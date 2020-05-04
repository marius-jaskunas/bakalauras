const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    data: {
        type: Object,
        required: true
    },
    enabled: {
        type: Boolean,
        required: true
    },
    services: {
        type: [{ type: Schema.Types.ObjectId, ref: "service" }]
    }
});

const Schemas = module.exports = mongoose.model("schema", schema);

module.exports.get = function (callback, limit) {
    Schemas.find(callback).limit(limit);
};