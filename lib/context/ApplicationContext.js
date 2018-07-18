const _ = require('lodash');

class ApplicationContext {
  constructor() {
    this.context = {};
  }

  /**
   * @description 通过指定 key 值获取对应的 context 信息.
   * @param {string} key
   * @returns {*}
   */
  getContextValue(key) {
    return this.context[key];
  }

  /**
   * @description 设置 context 值
   * @param {Object} value
   */
  setContextValue(value) {
    this.context = _.merge(this.context, value);
  }
}

module.exports = ApplicationContext;
