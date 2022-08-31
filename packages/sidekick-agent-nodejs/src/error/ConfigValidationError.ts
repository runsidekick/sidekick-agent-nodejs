export default class ConfigValidationError extends Error {
    constructor(message: string) {
        super(message)
    }
}