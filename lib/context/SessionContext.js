const _ = require('lodash');

class SessionContext {
  /**
   * @description 初始化 session context
   * @param {Object} context - 提供宿主对象所需的上下文信息.
   */
  constructor(context = {}) {
    this.__contextContent = context;
  }

  /**
   * @description 不暴露对 context 的直接写操作
   * @param {Object} val
   */
  set contextContent(val) {
    this.__contextContent = val || {};
  }
  /**
   * @description 获取 context 内容
   * @return {Object}
   */
  get contextContent() {
    return this.__contextContent;
  }

  /**
   * @method getContext
   * @description 获取 context 中 key 对应的值
   * @param {string} key - 提供 context key
   * @return {*}
   */
  getContextValue(key) {
    return this.__contextContent[key];
  }

  /**
   * @method setContextValue
   * @description 设置 context 值.
   * @param {Object} val - 设置 context value
   * @param {*} val - 设置 context value
   */
  setContextValue(val) {
    this.__contextContent = _.merge(this.__contextContent, val);
  }
}


module.exports = SessionContext;
