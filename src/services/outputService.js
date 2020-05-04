Service = require("../models/ServiceModel");
ServiceOutput = require("../models/ServiceOutputModel");
const ResponseManager = require("./responseManager");

const parsePayload = (payload) => {
    const parsedPayload = payload.reduce((parsedResult, x) => {
        parsedResult[x.name] = {
            required: x.ruleSelected === "True",
            type: x.type
        };

        if (x.type === "Array") {
            if (!x.childParams.length) {
                parsedResult[x.name].items = {
                    type: x.subType,
                    required: x.ruleSelected === "True"
                };
            } else {
                parsedResult[x.name].items = Object.values(parsePayload(x.childParams))[0];
            }
        }

        if (x.type === "Object") {
            parsedResult[x.name].items = parsePayload(x.childParams);
        }

        return parsedResult;
    }, {});
    return parsedPayload;
};

exports.addOutputPayload = function (req, res) {
    const body = req.body;
    ServiceOutput.findById(body.outputId, async  (err, output) => {
        output.payload = body.payload;
        output.parsedPayload = parsePayload(body.payload);

        try {
            await output.save();
        }
        catch (error) {
            return res.status(400).send(ResponseManager.errorMessage(error));
        }
        res.send(ResponseManager.successMessage("Output payload has been updated"));
    });
};

exports.addOutputToService = function (req, res) {
    const body = req.body;
    Service.findById(body.serviceId)
        .populate("outputs")
        .exec(async  (err, service) => {
            if (service.outputs.some(x => x.name === body.name)) {
                return res.status(400).send(ResponseManager.errorMessage("Output with the same name already exists."));
            }
            const output = new ServiceOutput;
            output.name = body.name;
            output.allowEmpty = true;

            try {
                await output.save();
                service.outputs.push(output);
                await service.save();
            }
            catch (error) {
                return res.status(400).send(ResponseManager.errorMessage(error));
            }
            res.send(ResponseManager.successMessage("Output has been created"));
        });
};

exports.updatePayloadEnabled = function (req, res) {
    const body = req.body;
    ServiceOutput.findById(body.outputId, async  (err, output) => {
        output.payloadEnabled = body.payloadEnabled;

        try {
            await output.save();
        }
        catch (error) {
            return res.status(400).send(ResponseManager.errorMessage(error));
        }
        res.send(ResponseManager.successMessage("Output has been updated"));
    });
};

exports.updateAllowEmpty = function (req, res) {
    const body = req.body;
    ServiceOutput.findById(body.outputId, async  (err, output) => {
        output.allowEmpty = body.allowEmpty;

        try {
            await output.save();
        }
        catch (error) {
            return res.status(400).send(ResponseManager.errorMessage(error));
        }
        res.send(ResponseManager.successMessage("Output has been updated"));
    });
};