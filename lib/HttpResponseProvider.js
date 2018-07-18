const _ = require('lodash');

class HttpResponseProvider {
  constructor(res) {
    this.res = res;
  }
  /**
   * @description 格式化需要返回到客户端的数据.
   * @param {Object} data - 待格式化的返回数据
   * @return {Object}
   */
  static defaultResponseDataFormatter(data) {
    return data;
  }
  /**
   * @description 返回正常业务处理数据.
   * @param {*} data
   * @param {Object} [options]
   * @param {function} [options.formatter] - formatting response data
   */
  handleResponse(data, options = {}) {
    const { formatter } = options;
    let resData = null;
    // 如果不存在自定义 formatter 处理函数, 则采用默认处理函数.
    if (!_.isFunction(formatter)) {
      resData = HttpResponseProvider.defaultResponseDataFormatter(data);
    } else {
      resData = formatter(data);
    }
    /**
     * NOTE: 这里没有检测 response header Content-Type. 默认一律用 Json 格式返回.
     */
    this.res.json(resData);
  }
}

module.exports = HttpResponseProvider;
