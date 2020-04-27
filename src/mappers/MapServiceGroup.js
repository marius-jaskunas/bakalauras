MapService = require("./MapService");

module.exports = (from) =>  {
    return {
        id: from._id,
        name: from.name,
        services: from.services ? from.services.map(x => MapService(x)) : [],
        expanded: false
    };
};