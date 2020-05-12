Schemas = require("../models/SchemaModel");
Service = require("../models/ServiceModel");
MapSchema = require("../mappers/MapSchema");
const ResponseManager = require("./responseManager");

exports.getAll = function (req, res) {
    Schemas
        .find()
        .populate({path: "services", populate: [{ path: "inputs"}, {path: "outputs"}]})
        .exec(function (err, schemas) {
            if (err) {
                return res.status(400).send(ResponseManager.errorMessage(err));
            }
            res.send(ResponseManager.successMessage(
                "Schemas retrieved successfully.",
                schemas.map(x => MapSchema(x))
            ));
        });
};

exports.get = function (req, res) {
    Schemas
        .findById(req.params.id)
        .populate({path: "services", populate: [{ path: "inputs"}, {path: "outputs"}]})
        .exec(async (err, schema) => {
            if (err) {
                return res.status(400).send(ResponseManager.errorMessage(err));
            }
            res.send(ResponseManager.successMessage("Schema retrieved successfully.", MapSchema(schema)));
        });
};

exports.create = async (req, res) => {
    const body = req.body;

    const schemas = await Schemas.find({ name: body.name});

    if (schemas && schemas.length) {
        return res.status(400).send(ResponseManager.errorMessage("Schema with the same name already exists."));
    }

    const schema = new Schemas;
    schema.name = body.name;
    schema.enabled = false;
    schema.data = [];

    schema.save(function (err) {
        if (err) {
            return res.status(400).send(ResponseManager.errorMessage(err));
        }
        res.send(ResponseManager.successMessage("Schema has been created."));
    });
};

exports.delete = function (req, res) {
    Schemas
        .findById(req.params.id)
        .populate("services")
        .exec(async (err, schema) => {
            if (!schema) {
                return res.status(400).send(ResponseManager.errorMessage("Schema not found."));
            }

            if (schema.services.length) {
                return res.status(400).send(ResponseManager.errorMessage("Schema can not be deleted while there are services inside"));
            }

            await Schemas.findByIdAndDelete(req.params.id);
            if (err) {
                return res.status(400).send(ResponseManager.errorMessage(err));
            }
            res.send(ResponseManager.successMessage("Schema was successfully deleted."));
        });
};

exports.updateSchemaData = function (req, res) {
    const body = req.body;
    Schemas.findById(req.params.id, async  (err, schema) => {
        const services = await Service.find({
            "_id" : {
                $in: body.data.map(x => x.id)
            }
        });

        schema.services = services;
        schema.data = body.data.map(x => ({
            id: x.id,
            x: x.x,
            y: x.y,
            inputs: x.inputs.map(input => ({
                data: input.data,
                name: input.name
            })),
            outputs: x.outputs.map(output => ({
                data: output.data,
                name: output.name,
                links: output.links
            })),
        }));

        try {
            await schema.save();
        }
        catch (error) {
            return res.status(400).send(ResponseManager.errorMessage(error));
        }
        res.send(ResponseManager.successMessage("Schema has been saved."));
    });
};

exports.updateEnabledFlag = function (req, res) {
    const body = req.body;
    Schemas.findById(req.params.id, async  (err, schema) => {
        schema.enabled = body.enabled;

        try {
            await schema.save();
        }
        catch (error) {
            return res.status(400).send(ResponseManager.errorMessage(error));
        }
        res.send(ResponseManager.successMessage(`Schema have been turned ${body.enabled ? "on" : "off"}.`));
    });
};
