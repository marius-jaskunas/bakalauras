exports.successMessage = (message, data) => {
    return {
        status: "Success",
        data,
        message
    };
};

exports.errorMessage = (message, data) => {
    return {
        status: "Error",
        data,
        message
    };
};