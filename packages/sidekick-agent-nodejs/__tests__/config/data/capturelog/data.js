const Joi = require('joi');

const Frames = [
    {
      "className": "dist/index.js",
      "lineNo": 45,
      "methodName": "(anonymous function)",
      "variables": [
        {
          "name": "req",
          "type": "object",
          "className": "IncomingMessage",
          "varTableIndex": 0
        },
        {
          "name": "res",
          "type": "object",
          "className": "ServerResponse",
          "varTableIndex": 1
        },
        {
          "name": "person",
          "type": "object",
          "className": "Object",
          "varTableIndex": 2
        }
      ]
    }
]

const CovertedLogSchema = Joi.object({
  req: Joi.object(),
        res: Joi.object(),
        person: Joi.object({
            name: Joi.string().valid('thundra-name'),
            surname: Joi.string().valid('thundra-surname'),
            age: Joi.number().valid(32),
            address: Joi.array()
                .items({
                    street: Joi.string().valid('meksica cad.'),
                    postCode: Joi.object({
                        code: Joi.string().valid(11)
                    })
                }) 
        })
});

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
          "name": "readable",
          "type": "boolean",
          "value": false
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
          "value": 0
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
          "name": "connection",
          "type": "object",
          "className": "Socket",
          "varTableIndex": 6
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
        },
        {
          "name": "_defaultKeepAlive",
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
          "varTableIndex": 11
        },
        {
          "name": "pipesCount",
          "type": "number",
          "value": 0
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
        }
      ],
      "ignored": true,
      "ignoredReason": "Max property size exceed."
    },
    {
      "description": "Object",
      "members": []
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
          "varTableIndex": 11
        },
        {
          "name": "_host",
          "type": "object",
          "varTableIndex": 11
        },
        {
          "name": "_readableState",
          "type": "object",
          "className": "ReadableState",
          "varTableIndex": 12
        },
        {
          "name": "readable",
          "type": "boolean",
          "value": true
        },
        {
          "name": "_events",
          "type": "object",
          "className": "Object",
          "varTableIndex": 13
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
          "varTableIndex": 14
        }
      ],
      "ignored": true,
      "ignoredReason": "Max property size exceed."
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
          "varTableIndex": 11
        },
        {
          "name": "_host",
          "type": "object",
          "varTableIndex": 11
        },
        {
          "name": "_readableState",
          "type": "object",
          "className": "ReadableState",
          "varTableIndex": 15
        },
        {
          "name": "readable",
          "type": "boolean",
          "value": true
        },
        {
          "name": "_events",
          "type": "object",
          "className": "Object",
          "varTableIndex": 16
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
          "varTableIndex": 17
        }
      ],
      "ignored": true,
      "ignoredReason": "Max property size exceed."
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
          "varTableIndex": 18
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
          "varTableIndex": 11
        },
        {
          "name": "tail",
          "type": "object",
          "varTableIndex": 11
        },
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
          "varTableIndex": 19
        },
        {
          "name": "length",
          "type": "number",
          "value": 0
        },
        {
          "name": "pipes",
          "type": "object",
          "varTableIndex": 11
        },
        {
          "name": "pipesCount",
          "type": "number",
          "value": 0
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
          "varTableIndex": 20
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
          "varTableIndex": 21
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
          "varTableIndex": 22
        },
        {
          "name": "length",
          "type": "number",
          "value": 0
        },
        {
          "name": "pipes",
          "type": "object",
          "varTableIndex": 11
        },
        {
          "name": "pipesCount",
          "type": "number",
          "value": 0
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
          "varTableIndex": 23
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
          "varTableIndex": 24
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
          "value": "meksica cad."
        },
        {
          "name": "postCode",
          "type": "object",
          "className": "Object",
          "varTableIndex": 25
        }
      ]
    },
    {
      "description": "BufferList",
      "members": [
        {
          "name": "head",
          "type": "object",
          "varTableIndex": 11
        },
        {
          "name": "tail",
          "type": "object",
          "varTableIndex": 11
        },
        {
          "name": "length",
          "type": "number",
          "value": 0
        }
      ]
    },
    {
      "description": "Array(2)",
      "members": [
        {
          "name": "0",
          "type": "function",
          "className": "Function",
          "value": "function 0()"
        },
        {
          "name": "1",
          "type": "function",
          "className": "Function",
          "value": "function 1()"
        },
        {
          "name": "length",
          "type": "number",
          "value": 2
        }
      ]
    },
    {
      "description": "Array(2)",
      "members": [
        {
          "name": "0",
          "type": "function",
          "className": "Function",
          "value": "function 0()"
        },
        {
          "name": "1",
          "type": "function",
          "className": "Function",
          "value": "function 1()"
        },
        {
          "name": "length",
          "type": "number",
          "value": 2
        }
      ]
    },
    {
      "description": "BufferList",
      "members": [
        {
          "name": "head",
          "type": "object",
          "varTableIndex": 11
        },
        {
          "name": "tail",
          "type": "object",
          "varTableIndex": 11
        },
        {
          "name": "length",
          "type": "number",
          "value": 0
        }
      ]
    },
    {
      "description": "Array(2)",
      "members": [
        {
          "name": "0",
          "type": "function",
          "className": "Function",
          "value": "function 0()"
        },
        {
          "name": "1",
          "type": "function",
          "className": "Function",
          "value": "function 1()"
        },
        {
          "name": "length",
          "type": "number",
          "value": 2
        }
      ]
    },
    {
      "description": "Array(2)",
      "members": [
        {
          "name": "0",
          "type": "function",
          "className": "Function",
          "value": "function 0()"
        },
        {
          "name": "1",
          "type": "function",
          "className": "Function",
          "value": "function 1()"
        },
        {
          "name": "length",
          "type": "number",
          "value": 2
        }
      ]
    },
    {
      "description": "Object",
      "members": [
        {
          "name": "code",
          "type": "number",
          "value": 11
        }
      ]
    }
]

module.exports = {
    Frames,
    CovertedLogSchema,
    ResolvedVariableTable,
}