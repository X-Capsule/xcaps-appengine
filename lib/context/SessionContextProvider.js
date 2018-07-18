/* eslint-disable no-useless-constructor,no-underscore-dangle */
const SessionContext = require('./SessionContext');

class SessionContextProvider {
  /**
   * @createSessionContext
   * @description 创建上下文信息实例对象.
   * @param context
   * @return {SessionContext}
   */
  static createSessionContext(context) {
    return new SessionContext(context);
  }
  /**
   * @description 获取类对象所拥有的 session context 信息.
   * @param {Object} classObject
   * @returns {SessionContext|*}
   */
  static getClassSessionContext(classObject) {
    return classObject.__sessionContextObj;
  }
  /**
   * @static bindServiceSessionContext
   * @description 将上下文信息绑定到指定类上.
   * @param {class} ClassObject
   * @param {Object} contextData - 用户自定义上下文集合
   */
  static bindClassSessionContext(ClassObject, contextData) {
    class Session extends ClassObject {
      constructor(...args) {
        super(...args);
      }
    }
    Session.prototype.__sessionContextObj = this.createSessionContext(contextData);
    return Session;
  }
}

module.exports = SessionContextProvider;
