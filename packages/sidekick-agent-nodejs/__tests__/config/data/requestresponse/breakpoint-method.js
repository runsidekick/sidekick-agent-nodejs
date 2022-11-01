const BreakpointMethod = (param) => {
    const field1 = param;
    const filed2 = 6;
    const field3 = {
        field4: 'dada'
    }

    return field1;
}

const CallerBreakpointMethod = (param) => {
    const callerField = 'CallerBreakpointMethod';
    return BreakpointMethod(param);
}

module.exports = {
    BreakpointMethod,
    CallerBreakpointMethod,
} 