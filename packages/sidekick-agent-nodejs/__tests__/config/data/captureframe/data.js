const Joi = require('joi');

const Frames = [
    {
        "className": "dist/index.js",
        "lineNo": 71,
        "methodName": "(anonymous function)",
        "variables": [
            {
                "name": "person",
                "type": "object",
                "className": "Object",
                "varTableIndex": 2
            }
        ]
    }
]

const CovertedFramesSchema = Joi.array()
    .items(
        Joi.object()
            .keys({
                lineNo: Joi.number(),
                methodName: Joi.string(),
                className: Joi.string(),
                variables: Joi.object({
                    person: Joi.object({
                        '@type': Joi.string(),
                        '@value': Joi.object({
                            name: Joi.object({
                                '@type': Joi.string(),
                                '@value': Joi.string().valid('thundra-name'),
                            }),
                            surname: Joi.object({
                                '@type': Joi.string(),
                                '@value': Joi.string().valid('thundra-surname'),
                            }),
                            age: Joi.object({
                                '@type': Joi.string(),
                                '@value': Joi.number().valid(32),
                            }),
                            address: Joi.object()
                                .keys({
                                    '@array': Joi.boolean(),
                                    '@type': Joi.string(),
                                    '@value': Joi.array().items(
                                        Joi.object({
                                            '@type': Joi.string(),
                                            '@value': Joi.object().keys({
                                                street: Joi.object(),
                                                postCode: Joi.object(), 
                                            }),
                                        })
                                    )
                                }) 
                        })
                    })
                }),
                
            })
);

const ResolvedVariableTable = [
    {
      "description": "IncomingMessage",
      "members": [
        {
          "name": "_readableState",
          "type": "object",
          "className": "ReadableState",
          "varTableIndex": 3
        },
        {
          "name": "_events",
          "type": "object",
          "className": "Object",
          "varTableIndex": 4
        },
        {
          "name": "_eventsCount",
          "type": "number",
          "value": 1
        },
        {
          "name": "_maxListeners",
          "type": "undefined",
          "value": ""
        },
        {
          "name": "socket",
          "type": "object",
          "className": "Socket",
          "varTableIndex": 5
        },
        {
          "name": "httpVersionMajor",
          "type": "number",
          "value": 1
        },
        {
          "name": "httpVersionMinor",
          "type": "number",
          "value": 1
        },
        {
          "name": "httpVersion",
          "type": "string",
          "value": "1.1"
        },
        {
          "name": "complete",
          "type": "boolean",
          "value": true
        },
        {
          "name": "headers",
          "type": "object",
          "className": "Object",
          "varTableIndex": 6
        }
      ],
      "ignored": true,
      "ignoredReason": "Max property size exceed."
    },
    {
      "description": "ServerResponse",
      "members": [
        {
          "name": "_events",
          "type": "object",
          "className": "Object",
          "varTableIndex": 7
        },
        {
          "name": "_eventsCount",
          "type": "number",
          "value": 1
        },
        {
          "name": "_maxListeners",
          "type": "undefined",
          "value": ""
        },
        {
          "name": "outputData",
          "type": "object",
          "className": "Array",
          "varTableIndex": 8
        },
        {
          "name": "outputSize",
          "type": "number",
          "value": 0
        },
        {
          "name": "writable",
          "type": "boolean",
          "value": true
        },
        {
          "name": "destroyed",
          "type": "boolean",
          "value": false
        },
        {
          "name": "_last",
          "type": "boolean",
          "value": false
        },
        {
          "name": "chunkedEncoding",
          "type": "boolean",
          "value": false
        },
        {
          "name": "shouldKeepAlive",
          "type": "boolean",
          "value": true
        }
      ],
      "ignored": true,
      "ignoredReason": "Max property size exceed."
    },
    {
      "description": "Object",
      "members": [
        {
          "name": "name",
          "type": "string",
          "value": "thundra-name"
        },
        {
          "name": "surname",
          "type": "string",
          "value": "thundra-surname"
        },
        {
          "name": "age",
          "type": "number",
          "value": 32
        },
        {
          "name": "address",
          "type": "object",
          "className": "Array",
          "varTableIndex": 9
        }
      ]
    },
    {
      "description": "ReadableState",
      "members": [
        {
          "name": "objectMode",
          "type": "boolean",
          "value": false
        },
        {
          "name": "highWaterMark",
          "type": "number",
          "value": 16384
        },
        {
          "name": "buffer",
          "type": "object",
          "className": "BufferList",
          "varTableIndex": 10
        },
        {
          "name": "length",
          "type": "number",
          "value": 0
        },
        {
          "name": "pipes",
          "type": "object",
          "className": "Array",
          "varTableIndex": 11
        },
        {
          "name": "flowing",
          "type": "boolean",
          "value": true
        },
        {
          "name": "ended",
          "type": "boolean",
          "value": true
        },
        {
          "name": "endEmitted",
          "type": "boolean",
          "value": true
        },
        {
          "name": "reading",
          "type": "boolean",
          "value": false
        },
        {
          "name": "sync",
          "type": "boolean",
          "value": false
        }
      ],
      "ignored": true,
      "ignoredReason": "Max property size exceed."
    },
    {
      "description": "Object",
      "members": [
        {
          "name": "end",
          "type": "function",
          "className": "Function",
          "value": "function end()"
        }
      ]
    },
    {
      "description": "Socket",
      "members": [
        {
          "name": "connecting",
          "type": "boolean",
          "value": false
        },
        {
          "name": "_hadError",
          "type": "boolean",
          "value": false
        },
        {
          "name": "_parent",
          "type": "object",
          "varTableIndex": 12
        },
        {
          "name": "_host",
          "type": "object",
          "varTableIndex": 12
        },
        {
          "name": "_readableState",
          "type": "object",
          "className": "ReadableState",
          "varTableIndex": 13
        },
        {
          "name": "_events",
          "type": "object",
          "className": "Object",
          "varTableIndex": 14
        },
        {
          "name": "_eventsCount",
          "type": "number",
          "value": 8
        },
        {
          "name": "_maxListeners",
          "type": "undefined",
          "value": ""
        },
        {
          "name": "_writableState",
          "type": "object",
          "className": "WritableState",
          "varTableIndex": 15
        },
        {
          "name": "allowHalfOpen",
          "type": "boolean",
          "value": true
        }
      ],
      "ignored": true,
      "ignoredReason": "Max property size exceed."
    },
    {
      "description": "Object",
      "members": [
        {
          "name": "content-type",
          "type": "string",
          "value": "application/json"
        },
        {
          "name": "user-agent",
          "type": "string",
          "value": "PostmanRuntime/7.28.4"
        },
        {
          "name": "accept",
          "type": "string",
          "value": "*/*"
        },
        {
          "name": "postman-token",
          "type": "string",
          "value": "701cfe23-5458-4e0d-9a11-2430314a7317"
        },
        {
          "name": "host",
          "type": "string",
          "value": "localhost:3000"
        },
        {
          "name": "accept-encoding",
          "type": "string",
          "value": "gzip, deflate, br"
        },
        {
          "name": "connection",
          "type": "string",
          "value": "keep-alive"
        },
        {
          "name": "content-length",
          "type": "string",
          "value": "169"
        }
      ]
    },
    {
      "description": "Object",
      "members": [
        {
          "name": "finish",
          "type": "function",
          "className": "Function",
          "value": "function finish()"
        }
      ]
    },
    {
      "description": "Array(0)",
      "members": [
        {
          "name": "length",
          "type": "number",
          "value": 0
        }
      ]
    },
    {
      "description": "Array(1)",
      "members": [
        {
          "name": "0",
          "type": "object",
          "className": "Object",
          "varTableIndex": 16
        },
        {
          "name": "length",
          "type": "number",
          "value": 1
        }
      ]
    },
    {
      "description": "BufferList",
      "members": [
        {
          "name": "head",
          "type": "object",
          "varTableIndex": 12
        },
        {
          "name": "tail",
          "type": "object",
          "varTableIndex": 12
        },
        {
          "name": "length",
          "type": "number",
          "value": 0
        }
      ]
    },
    {
      "description": "Array(0)",
      "members": [
        {
          "name": "length",
          "type": "number",
          "value": 0
        }
      ]
    },
    null,
    {
      "description": "ReadableState",
      "members": [
        {
          "name": "objectMode",
          "type": "boolean",
          "value": false
        },
        {
          "name": "highWaterMark",
          "type": "number",
          "value": 16384
        },
        {
          "name": "buffer",
          "type": "object",
          "className": "BufferList",
          "varTableIndex": 17
        },
        {
          "name": "length",
          "type": "number",
          "value": 0
        },
        {
          "name": "pipes",
          "type": "object",
          "className": "Array",
          "varTableIndex": 18
        },
        {
          "name": "flowing",
          "type": "boolean",
          "value": true
        },
        {
          "name": "ended",
          "type": "boolean",
          "value": false
        },
        {
          "name": "endEmitted",
          "type": "boolean",
          "value": false
        },
        {
          "name": "reading",
          "type": "boolean",
          "value": true
        },
        {
          "name": "sync",
          "type": "boolean",
          "value": false
        }
      ],
      "ignored": true,
      "ignoredReason": "Max property size exceed."
    },
    {
      "description": "Object",
      "members": [
        {
          "name": "end",
          "type": "object",
          "className": "Array",
          "varTableIndex": 19
        },
        {
          "name": "timeout",
          "type": "function",
          "className": "Function",
          "value": "function timeout()"
        },
        {
          "name": "data",
          "type": "function",
          "className": "Function",
          "value": "function data()"
        },
        {
          "name": "error",
          "type": "function",
          "className": "Function",
          "value": "function error()"
        },
        {
          "name": "close",
          "type": "object",
          "className": "Array",
          "varTableIndex": 20
        },
        {
          "name": "drain",
          "type": "function",
          "className": "Function",
          "value": "function drain()"
        },
        {
          "name": "resume",
          "type": "function",
          "className": "Function",
          "value": "function resume()"
        },
        {
          "name": "pause",
          "type": "function",
          "className": "Function",
          "value": "function pause()"
        }
      ]
    },
    {
      "description": "WritableState",
      "members": [
        {
          "name": "objectMode",
          "type": "boolean",
          "value": false
        },
        {
          "name": "highWaterMark",
          "type": "number",
          "value": 16384
        },
        {
          "name": "finalCalled",
          "type": "boolean",
          "value": false
        },
        {
          "name": "needDrain",
          "type": "boolean",
          "value": false
        },
        {
          "name": "ending",
          "type": "boolean",
          "value": false
        },
        {
          "name": "ended",
          "type": "boolean",
          "value": false
        },
        {
          "name": "finished",
          "type": "boolean",
          "value": false
        },
        {
          "name": "destroyed",
          "type": "boolean",
          "value": false
        },
        {
          "name": "decodeStrings",
          "type": "boolean",
          "value": false
        },
        {
          "name": "defaultEncoding",
          "type": "string",
          "value": "utf8"
        }
      ],
      "ignored": true,
      "ignoredReason": "Max property size exceed."
    },
    {
      "description": "Object",
      "members": [
        {
          "name": "street",
          "type": "string",
          "value": "strt"
        },
        {
          "name": "postCode",
          "type": "object",
          "className": "Object",
          "varTableIndex": 21
        }
      ]
    },
    {
      "description": "BufferList",
      "members": [
        {
          "name": "head",
          "type": "object",
          "ignored": true,
          "ignoredReason": "Max parse depth exceed."
        },
        {
          "name": "tail",
          "type": "object",
          "ignored": true,
          "ignoredReason": "Max parse depth exceed."
        },
        {
          "name": "length",
          "type": "number",
          "ignored": true,
          "ignoredReason": "Max parse depth exceed."
        }
      ]
    },
    {
      "description": "Array(0)",
      "members": [
        {
          "name": "length",
          "type": "number",
          "ignored": true,
          "ignoredReason": "Max parse depth exceed."
        }
      ]
    },
    {
      "description": "Array(2)",
      "members": [
        {
          "name": "0",
          "type": "function",
          "ignored": true,
          "ignoredReason": "Max parse depth exceed."
        },
        {
          "name": "1",
          "type": "function",
          "ignored": true,
          "ignoredReason": "Max parse depth exceed."
        },
        {
          "name": "length",
          "type": "number",
          "ignored": true,
          "ignoredReason": "Max parse depth exceed."
        }
      ]
    },
    {
      "description": "Array(2)",
      "members": [
        {
          "name": "0",
          "type": "function",
          "ignored": true,
          "ignoredReason": "Max parse depth exceed."
        },
        {
          "name": "1",
          "type": "function",
          "ignored": true,
          "ignoredReason": "Max parse depth exceed."
        },
        {
          "name": "length",
          "type": "number",
          "ignored": true,
          "ignoredReason": "Max parse depth exceed."
        }
      ]
    },
    {
      "description": "Object",
      "members": [
        {
          "name": "code",
          "type": "number",
          "ignored": true,
          "ignoredReason": "Max parse depth exceed."
        }
      ]
    }
]

module.exports = {
    Frames,
    CovertedFramesSchema,
    ResolvedVariableTable,
}