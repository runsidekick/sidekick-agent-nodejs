const Joi = require('joi');

const ApplicationStatusEventSchema = Joi.object({
    id: Joi.string(),
    name: Joi.string().valid('ApplicationStatusEvent'),
    sendAck: Joi.boolean(),
    type: Joi.string().valid('Event'),
    client: Joi.string().optional(),
    application: Joi.object({
        name: Joi.string(),
        hostName: Joi.string(),
        instanceId: '2336:d711b464-b09f-4c8d-91bd-4dbd956a891d@batuhanvm',
        runtime: Joi.string().valid('nodejs'),
        stage: Joi.string(),
        customTags: Joi.array(),
        version: Joi.string(),
        tracePoints: Joi.object(),
    }),
    time: Joi.number(),
    hostName: Joi.string(),
    applicationName: Joi.string(),
    applicationInstanceId: Joi.string(),
})

module.exports = {
    ApplicationStatusEventSchema,
}