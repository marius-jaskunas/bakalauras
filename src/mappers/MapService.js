module.exports = (from) =>  {
    return {
        id: from._id,
        name: from.name,
        inputs: from.inputs,
        outputs: from.outputs,
        selectedInput: true,
        selectedOutput: false,
        selectedOutputValue: null,
        selectedInputValue: null
    };
};