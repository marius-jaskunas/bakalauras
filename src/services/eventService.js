Schemas = require("../models/SchemaModel");
Service = require("../models/ServiceModel");
MapSchema = require("../mappers/MapSchema");
const AWS = require("aws-sdk");
const ResponseManager = require("./responseManager");
AWS.config.update({region: "eu-central-1"});

const validateRequired = (parsedPayload, schema) => {
    const errors = [];
    Object.keys(schema).forEach(x => {
        if (schema[x].required && parsedPayload[x]) {
            if (parsedPayload.type === "Object") {
                const objectErrors = validateRequired(parsedPayload[x], schema[x].items);

                if (objectErrors) {
                    errors.push(objectErrors);
                }
            }
        } else if (schema[x].required) {
            errors.push({
                inputName: x,
                message: "Value is missing in the payload."
            });
        }
    });

    return errors;
};

const parsePayload = (payload, schema, main = false) => {
    const errors = [];
    const parsedData = Object.keys(payload).reduce((acc, x) => {
        if ((schema[x] && schema[x].type.toLowerCase()) === typeof payload[x]) {
            if (schema[x].type === "Object") {
                const parsedElementData = parsePayload(payload[x], schema[x].items);
                if (parsedElementData.errors.length) {
                    errors.push({
                        inputName: x,
                        errors: parsedElementData.errors
                    });
                }

                acc[x] = parsedElementData.data;
            } else {
                acc[x] = payload[x];
            }
        } else if (Array.isArray(payload[x]) && (schema[x] && schema[x].type === "Array")) {
            if (schema[x].items.type === "Object") {
                const arrayErrors = [];

                acc[x] = payload[x].map(item => {
                    const parsedElementData = parsePayload(item);
                    if (parsedElementData.errors.length) {
                        arrayErrors.push(parsedElementData.errors);
                    }
                    return parsedElementData.data;
                });

                if (arrayErrors.length) {
                    errors.push({
                        inputName: x,
                        errors: arrayErrors
                    });
                }
            } else {
                const incorrectElements = payload[x].filter(item => typeof item !== schema[x].items.type.toLowerCase()
                    && !(Array.isArray(item) && schema[x].items.type === "Array"));

                if (incorrectElements.length) {
                    errors.push({
                        inputName: x,
                        message: `Not all array values are of type: ${schema[x].items.type}`
                    });
                }

                acc[x] = payload[x];
            }
        } else if (schema[x]){
            errors.push({
                inputName: x,
                message: `Types does not match. Expected: ${schema[x].type}, Received: ${typeof payload[x]}`
            });

            acc[x] = payload[x];
        } else {
            acc[x] = payload[x];
        }

        return acc;
    }, {});

    let requiredErrors = [];

    if (schema && main) {
        requiredErrors = validateRequired(parsedData, schema);
    }
    if (requiredErrors.length) {
        errors.push({
            errorType: "Missing parameters",
            errors: requiredErrors
        });
    }

    return {
        errors,
        data: parsedData
    };
};

exports.handleEvent = function (req, res) {
    const {serviceId, eventName, schemaId} = req.params;
    const body = req.body;
    Schemas.findById(schemaId)
        .populate({path: "services", populate: [{ path: "inputs"}, {path: "outputs"}]})
        .exec(async  (err, schema) => {
            try {
                if (!schema) {
                    return res.status(400).send(ResponseManager.errorMessage("Schema not found."));
                }

                const callerService = schema.data.find(x => x.id === serviceId);
                const service = schema.services.find(x => x.id === serviceId);

                if (!service) {
                    return res.status(400).send(ResponseManager.errorMessage("Service not found."));
                }

                const callerOutput = callerService.outputs.find(x => x.name === eventName);
                const output = service.outputs.find(x => x.name === eventName);

                if (!output) {
                    return res.status(400).send(ResponseManager.errorMessage("Output not found."));
                }

                if (callerOutput.data && callerOutput.data.apiKey !== req.headers["authorization"]) {
                    return res.status(403).send(ResponseManager.errorMessage("Invalid API Key"));
                }

                if (!schema.enabled) {
                    return res.status(400).send(ResponseManager.errorMessage("Schema is not enabled."));
                }

                const targets = callerOutput.links.map(x => {
                    const service = schema.services.find(y => y._id == x.blockId);
                    return service.inputs.find(y => y.name === x.name);
                });

                const requestErrors = [];

                if (Object.values(body).length) {
                    if (output.payloadEnabled) {
                        const parsedPayload = parsePayload(body, output.parsedPayload, true);

                        if (parsedPayload.errors.length) {
                            requestErrors.push({
                                errors: parsedPayload.errors
                            });
                        }
                    }
                } else {
                    if (output.payloadEnabled && !output.allowEmpty) {
                        requestErrors.push({
                            message: "Payload is expected, but was empty"
                        });
                    }
                }

                if (requestErrors.length) {
                    return res.status(400).send(ResponseManager.errorMessage("Body does not match output payload.", requestErrors));
                }
                const sqs = new AWS.SQS({apiVersion: "2012-11-05"});

                const errors = [];

                const requests = targets.map(x => {
                    let requestBody = body;

                    if (Object.values(requestBody).length) {
                        if (x.payloadEnabled && Object.keys(x.parsedPayload).length > 0) {
                            const parsedPayload = parsePayload(requestBody, x.parsedPayload, true);

                            if (parsedPayload.errors.length) {
                                errors.push({
                                    serviceInputName: x.name,
                                    errors: parsedPayload.errors
                                });
                                return null;
                            }
                            requestBody = parsedPayload.data;
                        } else {
                            requestBody = {};
                        }
                    } else {
                        if (x.payloadEnabled && !x.allowEmpty) {
                            errors.push({
                                inputName: x.name,
                                message: "Payload is expected, but was empty"
                            });

                            return null;
                        }
                    }

                    if (!x.url || x.url === "") {
                        errors.push({
                            inputName: x.name,
                            message: "Missing URL"
                        });

                        return null;
                    }

                    return JSON.stringify({
                        payload: requestBody,
                        url: x.url,
                        apiKey: x.apiKey || ""
                    });
                }).filter(x => x);

                console.log(JSON.stringify(requests));

                const promises = requests.map(x => {
                    const params = {
                        MessageBody: x,
                        QueueUrl: "https://sqs.eu-central-1.amazonaws.com/957344130478/Schema_Service_Inputs"
                    };

                    return sqs.sendMessage(params).promise();
                });

                const results = await Promise.all(promises);

                if (errors.length) {
                    return res.status(207).send(ResponseManager.successMessage({
                        sentMessages: results,
                        errors: errors
                    }));
                }

                return res.send(ResponseManager.successMessage({
                    sentMessages: results,
                    errors: errors
                }));
            } catch (e) {
                return res.status(500).send(ResponseManager.errorMessage("Failed to process", e));
            }
        });
};
