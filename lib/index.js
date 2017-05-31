'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _boom = require('boom');

var _boom2 = _interopRequireDefault(_boom);

var _stream = require('stream');

var _graphql = require('graphql');

var _package = require('../package.json');

var _renderGraphiQL = require('./renderGraphiQL');

var _renderGraphiQL2 = _interopRequireDefault(_renderGraphiQL);

var _accepts = require('accepts');

var _accepts2 = _interopRequireDefault(_accepts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Define constants
 */
var optionsSchema = {
  query: [_joi2.default.func(), _joi2.default.object({
    schemaFunc: _joi2.default.func().required(),
    context: _joi2.default.object(),
    rootValue: _joi2.default.object(),
    pretty: _joi2.default.boolean(),
    graphiql: _joi2.default.boolean(),
    formatError: _joi2.default.func(),
    validationRules: _joi2.default.array()
  }).required()],
  route: _joi2.default.object().keys({
    path: _joi2.default.string().required(),
    config: _joi2.default.object()
  }).required()
};

/**
 * Define helper: get options from object/function
 */
/**
 * Import dependencies
 */
var getOptions = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(options, request) {
    var optionsData, validation;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _promise2.default.resolve(typeof options === 'function' ? options(request) : options);

          case 2:
            optionsData = _context.sent;


            // Validate options
            validation = _joi2.default.validate(optionsData, optionsSchema.query);

            if (!validation.error) {
              _context.next = 6;
              break;
            }

            throw validation.error;

          case 6:
            return _context.abrupt('return', validation.value);

          case 7:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function getOptions(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Define helper: parse payload
 */
var parsePayload = function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(request) {
    var result, formattedResult;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return new _promise2.default(function (resolve) {
              if (request.payload instanceof _stream.Stream) {
                var data = '';
                request.payload.on('data', function (chunk) {
                  data += chunk;
                });
                request.payload.on('end', function () {
                  return resolve(data);
                });
              } else {
                resolve('{}');
              }
            });

          case 2:
            result = _context2.sent;


            // Return normalized payload
            formattedResult = null;

            if (request.mime === 'application/graphql') {
              formattedResult = { query: result };
            } else {
              formattedResult = JSON.parse(result);
            }
            return _context2.abrupt('return', formattedResult);

          case 6:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function parsePayload(_x3) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * Define helper: get GraphQL parameters from query/payload
 */
var getGraphQLParams = function getGraphQLParams(request) {
  var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  // GraphQL Query string.
  var query = request.query.query || payload.query;

  // Parse the variables if needed.
  var variables = request.query.variables || payload.variables;
  if (variables && typeof variables === 'string') {
    try {
      variables = JSON.parse(variables);
    } catch (error) {
      throw _boom2.default.badRequest('Variables are invalid JSON.');
    }
  }

  // Name of GraphQL operation to execute.
  var operationName = request.query.operationName || payload.operationName;

  // Return params
  return { query: query, variables: variables, operationName: operationName };
};

/**
 * Define helper: determine if GraphiQL can be displayed.
 */
var canDisplayGraphiQL = function canDisplayGraphiQL(request, data) {
  // If `raw` exists, GraphiQL mode is not enabled.
  var raw = request.query.raw !== undefined || data.raw !== undefined;

  // Allowed to show GraphiQL if not requested as raw and this request
  // prefers HTML over JSON.
  var accept = (0, _accepts2.default)(request.raw.req);
  return !raw && accept.type(['json', 'html']) === 'html';
};

/**
 * Define helper: execute query and create result
 */
var createResult = function () {
  var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(_ref4) {
    var context = _ref4.context,
        operationName = _ref4.operationName,
        query = _ref4.query,
        request = _ref4.request,
        rootValue = _ref4.rootValue,
        schemaFunc = _ref4.schemaFunc,
        showGraphiQL = _ref4.showGraphiQL,
        validationRules = _ref4.validationRules,
        variables = _ref4.variables;
    var schema, source, documentAST, validationErrors, operationAST, result, code;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return schemaFunc();

          case 2:
            schema = _context3.sent;

            if (query) {
              _context3.next = 7;
              break;
            }

            if (!showGraphiQL) {
              _context3.next = 6;
              break;
            }

            return _context3.abrupt('return', null);

          case 6:
            throw _boom2.default.badRequest('Must provide query string.');

          case 7:

            // GraphQL source.
            source = new _graphql.Source(query, 'GraphQL request');

            // Parse source to AST, reporting any syntax error.

            documentAST = void 0;
            _context3.prev = 9;

            documentAST = (0, _graphql.parse)(source);
            _context3.next = 16;
            break;

          case 13:
            _context3.prev = 13;
            _context3.t0 = _context3['catch'](9);
            throw _boom2.default.badRequest('Syntax error', [_context3.t0]);

          case 16:

            // Validate AST, reporting any errors.
            validationErrors = (0, _graphql.validate)(schema, documentAST, validationRules);

            if (!(validationErrors.length > 0)) {
              _context3.next = 19;
              break;
            }

            throw _boom2.default.badRequest('Validation error', validationErrors);

          case 19:
            if (!(request.method === 'get')) {
              _context3.next = 25;
              break;
            }

            // Determine if this GET request will perform a non-query.
            operationAST = (0, _graphql.getOperationAST)(documentAST, operationName);

            if (!(operationAST && operationAST.operation !== 'query')) {
              _context3.next = 25;
              break;
            }

            if (!showGraphiQL) {
              _context3.next = 24;
              break;
            }

            return _context3.abrupt('return', null);

          case 24:
            throw _boom2.default.methodNotAllowed('Can only perform a ' + operationAST.operation + ' operation from a POST request.');

          case 25:

            // Perform the execution, reporting any errors creating the context.
            result = void 0;
            _context3.prev = 26;
            _context3.next = 29;
            return (0, _graphql.execute)(schema, documentAST, rootValue, context, variables, operationName);

          case 29:
            result = _context3.sent;
            _context3.next = 35;
            break;

          case 32:
            _context3.prev = 32;
            _context3.t1 = _context3['catch'](26);
            throw _boom2.default.badRequest('Context error', [_context3.t1]);

          case 35:
            if (!result.errors) {
              _context3.next = 44;
              break;
            }

            code = selectStatusCode(result.errors);
            _context3.t2 = code;
            _context3.next = _context3.t2 === 409 ? 40 : 42;
            break;

          case 40:
            throw _boom2.default.conflict('Conflict error', result.errors);

          case 42:
            throw _boom2.default.badRequest('Bad request', result.errors);

          case 44:
            return _context3.abrupt('return', result);

          case 45:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined, [[9, 13], [26, 32]]);
  }));

  return function createResult(_x5) {
    return _ref3.apply(this, arguments);
  };
}();

function selectStatusCode(errors) {
  var priorities = [409, 404, 400, 500, 512, 408, 440];
  // https://github.com/graphql/graphql-js/issues/251y
  var codes = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = (0, _getIterator3.default)(errors), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var error = _step.value;

      codes.push(JSON.parse((0, _stringify2.default)(error.originalError)).code);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  codes.sort(function (code1, code2) {
    return priorities.indexOf(code1) - priorities.indexOf(code2);
  });
  return codes[0];
}

/**
 * Define handler
 */
var handler = function handler(route) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return function () {
    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(request, reply) {
      var errorFormatter, _ref6, schemaFunc, context, rootValue, pretty, graphiql, customFormatError, additionalValidationRules, validationRules, payload, showGraphiQL, _getGraphQLParams, query, variables, operationName, result, _error$output$statusC, statusCode, errors;

      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              errorFormatter = _graphql.formatError;
              _context4.prev = 1;
              _context4.next = 4;
              return getOptions(options, request);

            case 4:
              _ref6 = _context4.sent;
              schemaFunc = _ref6.schemaFunc;
              context = _ref6.context;
              rootValue = _ref6.rootValue;
              pretty = _ref6.pretty;
              graphiql = _ref6.graphiql;
              customFormatError = _ref6.formatError;
              additionalValidationRules = _ref6.validationRules;
              validationRules = _graphql.specifiedRules;

              if (additionalValidationRules) {
                validationRules = validationRules.concat(additionalValidationRules);
              }

              if (customFormatError) {
                errorFormatter = customFormatError;
              }

              // GraphQL HTTP only supports GET and POST methods.

              if (!(request.method !== 'get' && request.method !== 'post')) {
                _context4.next = 17;
                break;
              }

              throw _boom2.default.methodNotAllowed('GraphQL only supports GET and POST requests.');

            case 17:
              _context4.next = 19;
              return parsePayload(request);

            case 19:
              payload = _context4.sent;


              // Can we show graphiQL?
              showGraphiQL = graphiql && canDisplayGraphiQL(request, payload);

              // Get GraphQL params from the request and POST body data.

              _getGraphQLParams = getGraphQLParams(request, payload), query = _getGraphQLParams.query, variables = _getGraphQLParams.variables, operationName = _getGraphQLParams.operationName;

              // Create the result

              _context4.next = 24;
              return createResult({
                context: context,
                operationName: operationName,
                query: query,
                request: request,
                rootValue: rootValue,
                schemaFunc: schemaFunc,
                showGraphiQL: showGraphiQL,
                validationRules: validationRules,
                variables: variables
              });

            case 24:
              result = _context4.sent;


              // Format any encountered errors.
              if (result && result.errors) {
                result.errors = result.errors.map(errorFormatter);
              }

              // If allowed to show GraphiQL, present it instead of JSON.
              if (showGraphiQL) {
                reply((0, _renderGraphiQL2.default)({ query: query, variables: variables, operationName: operationName, result: result })).type('text/html');
              } else {
                // Otherwise, present JSON directly.
                reply((0, _stringify2.default)(result, null, pretty ? 2 : 0)).type('application/json');
              }
              _context4.next = 34;
              break;

            case 29:
              _context4.prev = 29;
              _context4.t0 = _context4['catch'](1);

              // Return error, picking up Boom overrides
              _error$output$statusC = _context4.t0.output.statusCode, statusCode = _error$output$statusC === undefined ? 500 : _error$output$statusC;
              errors = _context4.t0.data || [_context4.t0];

              reply({ errors: errors.map(errorFormatter) }).code(statusCode);

            case 34:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, undefined, [[1, 29]]);
    }));

    return function (_x7, _x8) {
      return _ref5.apply(this, arguments);
    };
  }();
};

/**
 * Define handler defaults
 */
handler.defaults = function (method) {
  if (method === 'post') {
    return {
      payload: {
        output: 'stream'
      }
    };
  }
  return {};
};

/**
 * Define plugin
 */
function register(server) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var next = arguments[2];

  // Validate options
  var validation = _joi2.default.validate(options, optionsSchema);
  if (validation.error) {
    throw validation.error;
  }
  var _validation$value = validation.value,
      route = _validation$value.route,
      query = _validation$value.query;

  // Register handler

  server.handler('graphql', handler);

  // Register route
  server.route({
    method: ['get', 'post'],
    path: route.path,
    config: route.config,
    handler: {
      graphql: query
    }
  });

  // Done
  return next();
}

/**
 * Define plugin attributes
 */
register.attributes = { name: 'graphql', version: _package.version };

/**
 * Export plugin
 */
exports.default = register;
module.exports = exports['default'];