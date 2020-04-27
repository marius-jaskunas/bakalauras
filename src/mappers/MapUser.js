module.exports = (from) =>  {
    return {
        id: from._id,
        name: from.name,
        email: from.email,
        role: from.role
    };
};