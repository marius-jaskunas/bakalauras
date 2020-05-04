module.exports = (from) =>  {
    return {
        id: from._id,
        name: from.name,
        payload: from.payload,
        parsedPayload: from.parsedPayload,
        payloadEnabled: from.payloadEnabled,
        allowEmpty: from.allowEmpty
    };
};