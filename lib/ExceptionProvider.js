const _ = require('lodash');

class ExceptionProvider {
  /**
   * @description 格式化需要返回到客户端的错误处理信息.
   * @param {Exception} exception
   * @return {Object}
   */
  static formatException(exception) {
    return {
      code: exception.code,
      message: exception.message,
    };
  }

  /**
   * @description 处理 Error 错误格式
   * @param {Exception} error
   * @param {string} code
   * @return {Object}
   */
  static formatError(error, code) {
    const errCode = _.has(error, 'code') ? error.code : code;
    return {
      code: errCode,
      message: error.message,
    };
  }
}

module.exports = ExceptionProvider;
