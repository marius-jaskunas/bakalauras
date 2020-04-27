ServiceGroup = require("../models/ServiceGroupModel");
Service = require("../models/ServiceModel");
ServiceInput = require("../models/ServiceInputModel");
ServiceOutput = require("../models/ServiceOutputModel");
MapServiceGroup = require("../mappers/MapServiceGroup");
MapService = require("../mappers/MapService");
const ResponseManager = require("./responseManager");

exports.getAll = function (req, res) {
    ServiceGroup
        .find()
        .populate("services")
        .exec(function (err, serviceGroups) {
            if (err) {
                return res.send(ResponseManager.errorMessage(err));
            }
            res.send(ResponseManager.successMessage(
                "Service Groups retrieved successfully",
                serviceGroups.map(x => MapServiceGroup(x))
            ));
        });
};

exports.create = function (req, res) {
    const body = req.body;
    const serviceGroup = new ServiceGroup;
    serviceGroup.name = body.name;
    serviceGroup.services = [];

    serviceGroup.save(function (err) {
        if (err) {
            return res.send(ResponseManager.errorMessage(err));
        }
        res.send(ResponseManager.successMessage("Group has been created"));
    });
};

exports.addService = function (req, res) {
    const body = req.body;
    ServiceGroup.findById(body.groupId, async  (err, serviceGroup) => {
        const service = new Service;
        service.name = body.name;

        try {
            await service.save();
            serviceGroup.services.push(service);
            await serviceGroup.save();
        }
        catch (error) {
            return res.send(ResponseManager.errorMessage(err));
        }
        res.send(ResponseManager.successMessage("Service has been created"));
    });
};

exports.addInputToService = function (req, res) {
    const body = req.body;
    Service.findById(body.serviceId, async  (err, service) => {
        const input = new ServiceInput;
        input.name = body.name;
        input.allowEmpty = true;
        input.isSynchronous = true;

        try {
            await input.save();
            service.inputs.push(input);
            await service.save();
        }
        catch (error) {
            return res.send(ResponseManager.errorMessage(err));
        }
        res.send(ResponseManager.successMessage("Input has been created"));
    });
};

exports.getGroup = function (req, res) {
    ServiceGroup
        .findById(req.params.id)
        .populate("services")
        .exec(function (err, serviceGroup) {
            if (err) {
                return res.send(ResponseManager.errorMessage(err));
            }
            res.send(ResponseManager.successMessage("Group retrieved successfully", MapServiceGroup(serviceGroup)));
        });
};

exports.getService = function (req, res) {
    Service
        .findById(req.params.id)
        .populate("inputs")
        .populate("outputs")
        .exec(function (err, service) {
            if (err) {
                return res.send(ResponseManager.errorMessage(err));
            }
            res.send(ResponseManager.successMessage("Group retrieved successfully", MapService(service)));
        });
};