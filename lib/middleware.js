const { Exception, NotFoundException } = require('xcaps-exception');
const ExceptionProvider = require('./ExceptionProvider');
const HttpResponseProvider = require('./HttpResponseProvider');
const { SwaggerAPI } = require('xcaps-swagger');
const _ = require('lodash');
const Promise = require('bluebird');
const EventEmitter = require('events');
const logging = require('xcaps-logging');

const { ConsoleHandler } = logging;

const logger = logging.getLogger('AppEngine.exceptionProvider');
logger.addHandler(new ConsoleHandler('infoConsoleHandler', 'trace'));

class ProcessHandler extends EventEmitter {
  constructor() {
    super();
    this.on('notify', (handlers) => {
      Promise.all(handlers);
    });
  }
  notify(handlers) {
    if (handlers.length > 0) {
      this.emit('notify', handlers);
    }
  }
  static promisifyHandler(handler, args) {
    return new Promise((resolve, reject) => {
      // 如果自定义出现异常, 则由自已的业务逻辑进行处理. 在此不处理任何异常.
      try {
        handler(...args);
      } catch (err) {
        throw err;
      }
    });
  }
}

/**
 * @description 如果未找到 API route, 则返回404
 * @param {Object} req
 * @param {Object} res
 * @param {function} next
 */
function apiNotFoundHandler(req, res, next) {
  const exception = new NotFoundException();
  next(exception);
}
/**
 * @description 处理 Swagger validation error 的信息.
 * @param options
 * @return {function(*, *, *, *)}
 */
function swaggerValidationFailedHandler(options = {}) {
  /**
   * @description 处理 Swagger validation error 的信息.
   * @param err
   * @param req
   * @param res
   * @param next
   */
  return (err, req, res, next) => {
    const exception = err;
    // 检测 swagger Exception
    if (SwaggerAPI.isValidationException(exception)) {
      // 代替 swagger Exception 的错误代码, 目前先不做处理. 只用 400 进行代替.
      exception.code = res.statusCode;
    }
    next(exception);
  };
}

/**
 * @description 异常处理中间件定义
 * @param {Object} [options]
 * @param {function} [options.handler] - callback handler
 * @param {function} [options.resDataFormatter] - response data formatter
 * @return {function(*=, *, *, *)}
 */
function exceptionHandler(options = {}) {
  const { handler, resDataFormatter } = options;
  const processHandler = new ProcessHandler();
  /**
   * @description 处理 Exception 异常信息, 建立标准化异常处理模型. 目前, 为 V1.0.2-alpha 版本.
   * @param {Exception} exception - Exception object (建议使用 Exception 提供的 Http Response Exceptions,
   * 具体请参考 xcaps-exception 包).
   * @param {Object} req - request data object
   * @param {Object} res - response data object
   * @param {function} [next] - next callback function
   */
  return (exception, req, res, next) => {
    /**
     * 检测 exception 是否是 checked Exception. 目前, 在架构异常处理模块中给出了两种异常类型.
     * - 业务性异常 Exception
     * - 系统级别异常 Error
     */
    /**
     * 如果 Exception 为 Http Response Exception. 则可以从 Exception 中提取 http status.
     * 并将其设定到 Response 的 Status 中去. 默认情况返回 200.
     */
    if (_.has(exception, 'httpStatus')) {
      res.status(exception.httpStatus);
    }
    // NOTE: 注意必须提供 errorMiddlewareHandler, 如果不定义, 则无法处理 next
    if (Exception.isError(exception)) {
      return next(exception);
    }
    /**
     * 处理业务级别的异常
     */
    const handlers = [];
    // 如果存在自定义异常处理函数, 则调用其方法
    if (exception.exceptionHandler) {
      handlers.push(ProcessHandler.promisifyHandler(exception.exceptionHandler, [exception]));
    }
    /**
     * 处理用户自定义异常处理回调函数.
     */
    if (handler) {
      handlers.push(ProcessHandler.promisifyHandler(handler, [exception]));
    }
    // 异步处理用户提供的 exception handlers 方法.
    processHandler.notify(handlers);
    const cause = _.isEmpty(exception.cause) ? exception : exception.getCause();
    let formatter = () => ExceptionProvider.formatException(cause);
    if (_.isFunction(resDataFormatter)) {
      formatter = () => resDataFormatter(cause);
    }
    const httpResponseProvider = new HttpResponseProvider(res);
    return httpResponseProvider.handleResponse(null, {
      formatter,
    });
  };
}

/**
 * @description 异常处理中间件定义
 * @param {Object} [options]
 * @param {function} [options.handler] - callback handler
 * @param {function} [options.resDataFormatter] - response data formatter
 * @return {function(*=, *, *, *)}
 */
function serverErrorHandler(options = {}) {
  const { handler, resDataFormatter } = options;
  const processHandler = new ProcessHandler();
  /**
   * @description 处理服务错误异常
   * @param {Exception} exception - 异常信息对象
   * @param {Object} req
   * @param {Object} res
   * @param {function} next
   */
  return (exception, req, res, next) => {
    let exceptionContent = exception;
    /**
     * 如果捕获的异常为 unchecked 异常, 并且有业务给出该字段则先去获取 cause. 因为只有自定义的
     * Exception Class 才有 checked 标识.
     */
    if (!Exception.isError(exceptionContent)) {
      const message = `
        NOTE: 在调用 serverErrorHandler 中间件之前(一定是之前), 必须加载 exceptionHandler 方法.
        否则在此不处理任何业务级别的异常, 你需要请检查你的 middleware 加载项. 当然除了使用默认的
        exceptionHandler 方法外, 你也可以定义自己的 exceptionHandler 方法.'
      `;
      logger.error(message);
      throw new Error(message);
    }
    /**
     * 在 unchecked 模式下, 会出现非 xcaps-exception 定义的错误. 在这种情况下, http status
     * 不会被给出, 所以我们只能对默认值为 200 的情况进行特殊处理, 将其设置为 500.
     */
    if (res.statusCode === 200) {
      res.status(500);
    }
    // 如果存在 cause 情况, 设计原则上目前只处理 cause 有关内容.
    if (_.has(exception, 'getCause')) {
      const cause = exception.getCause();
      if (cause) {
        exceptionContent = cause;
      }
    }
    // 处理 unchecked error 级别异常.
    const handlers = [];
    if (handler) {
      handlers.push(ProcessHandler.promisifyHandler(handler, [exception]));
    }
    // 异步处理用户提供的 exception handlers 方法.
    processHandler.notify(handlers);
    let formatter = () => ExceptionProvider.formatError(exceptionContent, res.statusCode);
    if (_.isFunction(resDataFormatter)) {
      formatter = () => resDataFormatter(exceptionContent, res.statusCode);
    }
    const httpResponseProvider = new HttpResponseProvider(res);
    return httpResponseProvider.handleResponse(null, {
      formatter,
    });
  };
}

module.exports = {
  exceptionHandler,
  apiNotFoundHandler,
  swaggerValidationFailedHandler,
  serverErrorHandler,
};
