MapService = require("./MapService");

module.exports = (from) =>  {
    return {
        id: from._id,
        name: from.name,
        enabled: from.enabled,
        data: from.data && from.data.map(x => {
            const service = from.services.find(service => service._id == x.id);
            const inputs = service.inputs;
            const outputs = service.outputs;
            return {
                title: service.name,
                id: x.id,
                x: x.x,
                y: x.y,
                inputs: inputs && inputs
                    .map(input => {
                        const dataInput = x.inputs && x.inputs.find(dataInput => dataInput.name === input.name);
                        return {
                            id: input.id,
                            data: dataInput && dataInput.data || [],
                            name: input.name,
                            links: [],
                            position: {
                                x: 0,
                                y: 0
                            },
                            url: input.url,
                            apiKey: input.apiKey,
                            parsedPayload: input.parsedPayload,
                            payloadEnabled: input.payloadEnabled,
                            payload: input.payload,
                            allowEmpty: input.allowEmpty
                        };
                    }),
                outputs: outputs && outputs
                    .map(output => {
                        const dataOutput = x.outputs && x.outputs.find(dataOutput => dataOutput.name === output.name);
                        return {
                            id: output.id,
                            data: dataOutput && dataOutput.data || [],
                            name: output.name,
                            links: dataOutput && dataOutput.links || [],
                            position: {
                                x: 0,
                                y: 0
                            },
                            parsedPayload: output.parsedPayload,
                            payloadEnabled: output.payloadEnabled,
                            payload: output.payload,
                            allowEmpty: output.allowEmpty
                        };
                    })
            };
        }),
    };
};
