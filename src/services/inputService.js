Service = require("../models/ServiceModel");
ServiceInput = require("../models/ServiceInputModel");
const ResponseManager = require("./responseManager");

exports.addInputToService = function (req, res) {
    const body = req.body;
    Service.findById(body.serviceId)
        .populate("inputs")
        .exec(async  (err, service) => {
            if (service.inputs.some(x => x.name === body.name)) {
                return res.status(400).send(ResponseManager.errorMessage("Input with the same name already exists."));
            }

            const input = new ServiceInput;
            input.name = body.name;
            input.allowEmpty = true;
            input.payload = [];
            input.payloadEnabled = false;

            try {
                await input.save();
                service.inputs.push(input);
                await service.save();
            }
            catch (error) {
                return res.status(400).send(ResponseManager.errorMessage(error));
            }
            res.send(ResponseManager.successMessage("Input has been created"));
        });
};

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

exports.addInputPayload = function (req, res) {
    const body = req.body;
    ServiceInput.findById(body.inputId, async  (err, input) => {
        input.payload = body.payload;
        input.parsedPayload = parsePayload(body.payload);

        try {
            await input.save();
        }
        catch (error) {
            return res.status(400).send(ResponseManager.errorMessage(error));
        }
        res.send(ResponseManager.successMessage("Input payload has been updated"));
    });
};

exports.updatePayloadEnabled = function (req, res) {
    const body = req.body;
    ServiceInput.findById(body.inputId, async  (err, input) => {
        input.payloadEnabled = body.payloadEnabled;

        try {
            await input.save();
        }
        catch (error) {
            return res.status(400).send(ResponseManager.errorMessage(error));
        }
        res.send(ResponseManager.successMessage("Input has been updated"));
    });
};

exports.updateAllowEmpty = function (req, res) {
    const body = req.body;
    ServiceInput.findById(body.inputId, async  (err, input) => {
        input.allowEmpty = body.allowEmpty;

        try {
            await input.save();
        }
        catch (error) {
            return res.status(400).send(ResponseManager.errorMessage(error));
        }
        res.send(ResponseManager.successMessage("Input has been updated"));
    });
};

exports.updateConnectionDetails = function (req, res) {
    const body = req.body;
    ServiceInput.findById(body.inputId, async  (err, input) => {
        input.url = body.url;
        input.apiKey = body.apiKey;

        try {
            await input.save();
        }
        catch (error) {
            return res.status(400).send(ResponseManager.errorMessage(error));
        }
        res.send(ResponseManager.successMessage("Input has been updated"));
    });
};

exports.delete = function (req, res) {
    ServiceInput.findByIdAndDelete(req.params.id, async  (err) => {
        if (err) {
            return res.status(400).send(ResponseManager.errorMessage(err));
        }
        res.send(ResponseManager.successMessage("Input has been deleted"));
    });
};