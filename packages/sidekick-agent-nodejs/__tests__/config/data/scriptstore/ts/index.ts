export type FunctionAParam = {
    a: number;
    b: number;
};

export type FunctionAResult = {
    result: number;
};

export const functionA = (param: FunctionAParam): FunctionAResult => {
    const a = param.a;
    const b = param.b;

    const result = a * b;
    return {
        result,
    } as FunctionAResult;
}