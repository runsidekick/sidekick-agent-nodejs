const ErrorMethod = (param) => {
    const field1 = param;
    throw new Error('Error from test.')
}

module.exports = {
    ErrorMethod,
} 