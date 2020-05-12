ServiceGroup = require("../models/ServiceGroupModel");
Service = require("../models/ServiceModel");
MapService = require("../mappers/MapService");
const ResponseManager = require("./responseManager");

exports.addService = function (req, res) {
    const body = req.body;
    ServiceGroup.findById(body.groupId)
        .populate("services")
        .exec(async  (err, serviceGroup) => {
            if (serviceGroup.services.some(x => x.name === body.name)) {
                return res.status(400).send(ResponseManager.errorMessage("Service with the same name already exists."));
            }

            const service = new Service;
            service.name = body.name;

            try {
                await service.save();
                serviceGroup.services.push(service);
                await serviceGroup.save();
            }
            catch (error) {
                return res.status(400).send(ResponseManager.errorMessage(error));
            }
            res.send(ResponseManager.successMessage("Service has been created."));
        });
};

exports.getService = function (req, res) {
    Service
        .findById(req.params.id)
        .populate("inputs")
        .populate("outputs")
        .exec(function (err, service) {
            if (err) {
                return res.status(400).send(ResponseManager.errorMessage(err));
            }
            res.send(ResponseManager.successMessage("Group retrieved successfully", MapService(service)));
        });
};


exports.delete = function (req, res) {
    Service
        .findById(req.params.id)
        .populate("inputs")
        .populate("outputs")
        .exec(async function (err, service) {
            if (!service) {
                return res.status(400).send(ResponseManager.errorMessage("Service not found."));
            }

            if (service.inputs.length || service.outputs.length) {
                return res.status(400).send(ResponseManager.errorMessage("Service can not be deleted while there are inputs or outputs inside."));
            }

            await Service.findByIdAndDelete(req.params.id);
            if (err) {
                return res.status(400).send(ResponseManager.errorMessage(err));
            }
            res.send(ResponseManager.successMessage("service retrieved successfully", MapService(service)));
        });
};