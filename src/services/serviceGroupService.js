ServiceGroup = require("../models/ServiceGroupModel");
MapServiceGroup = require("../mappers/MapServiceGroup");
const ResponseManager = require("./responseManager");

exports.getAll = function (req, res) {
    ServiceGroup
        .find()
        .populate({path: "services", populate: [{ path: "inputs"}, {path: "outputs"}]})
        .exec(function (err, serviceGroups) {
            if (err) {
                return res.status(400).send(ResponseManager.errorMessage(err));
            }
            res.send(ResponseManager.successMessage(
                "Service Groups retrieved successfully",
                serviceGroups.map(x => MapServiceGroup(x))
            ));
        });
};

exports.create = async (req, res) => {
    const body = req.body;

    const serviceGroups = await ServiceGroup.find({ name: body.name});

    if (serviceGroups && serviceGroups.length) {
        return res.status(400).send(ResponseManager.errorMessage("Group with the same name already exists."));
    }

    const serviceGroup = new ServiceGroup;
    serviceGroup.name = body.name;
    serviceGroup.services = [];

    serviceGroup.save(function (err) {
        if (err) {
            return res.status(400).send(ResponseManager.errorMessage(err));
        }
        res.send(ResponseManager.successMessage("Group has been created"));
    });
};

exports.getGroup = function (req, res) {
    ServiceGroup
        .findById(req.params.id)
        .populate({path: "services", populate: [{ path: "inputs"}, {path: "outputs"}]})
        .exec(async (err, serviceGroup) => {
            if (err) {
                return res.status(400).send(ResponseManager.errorMessage(err));
            }
            res.send(ResponseManager.successMessage("Group retrieved successfully", MapServiceGroup(serviceGroup)));
        });
};
