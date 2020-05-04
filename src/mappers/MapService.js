MapServiceInput = require("./MapServiceInput");
MapServiceOutput = require("./MapServiceOutput");

module.exports = (from) =>  {
    return {
        id: from._id,
        name: from.name,
        inputs: from.inputs ? from.inputs.map(x => MapServiceInput(x)) : [],
        outputs: from.outputs ? from.outputs.map(x => MapServiceOutput(x)) : [],
        selectedInput: true,
        selectedOutput: false,
        selectedOutputValue: null,
        selectedInputValue: null
    };
};