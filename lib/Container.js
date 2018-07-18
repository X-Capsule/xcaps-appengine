const { HttpServer } = require('./server');

/**
 * @function normalizePort
 * @description Normalize a port into a number, string, or false.
 * @param {string || number} val - port value.
 * @returns {*}
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * @class AppEngine
 * @description 该类为应用运行容器, 主要功能是通过自定义应用配置环境, 将 App instance
 * 运行在 app engine 容器中运行. 目前, 不提供对外 Extends 的方法.
 */
class Container {
  /**
   * @method constructor
   * @description 该 Class 是一个容器化方案, 主要是封装隔离应用运行环境配置, 以及作为运行
   * 入口. 负责提供运行环境相关服务.
   * @param {object} options
   * @param {object} options.application - Application 表述了需要运行在 container
   * 中的应用实体. 关于 application 的标准定义请参考 './application.js' 中关于 Class
   * Application 的定义.
   * @param {string || number} options.port - server port
   */
  constructor(options = {}) {
    const { application, port } = options;
    this.setApplication(application);
    this.setHttpServer(port);
    this.initialize();
  }
  /**
   * @description 用户自定义初始化工作流程(reserved)
   * @param options
   */
  // eslint-disable-next-line class-methods-use-this
  initialize(options = {}) {
    // 该方法可以被重写
  }

  setApplication(application) {
    this.application = application;
  }

  /**
   * @method start
   * @description Start a application server which is injected into container.
   * @param {object} options
   */
  runContainer(options = {}) {
    /**
     * 定义 container running 规则
     */
    this.httpServer.run();
  }
  /**
   * @description 该方法用于准备运行基于 Node HttpServer 的环境
   * @param {number} port - server port
   * @private
   */
  setHttpServer(port) {
    /**
     * 实例化 server payload of application.
     * 关于 requestListener 参数, 该参数必须提供一个 http handler function, 用于
     * 处理 http request.
     * 注明: Application 实例包含了定义应用相关的信息. 其中 handler 只作为了实例中的一个
     * 属性. 所以在初始化 HttpServer 时我们要提取 handler 信息. 在 Application 中提供了
     * 提取 requestListener handler 相关的方法. 关于 application 的标准定义请参考
     * './application.js' 中 Class Application 的定义.
     */
    this.httpServer = new HttpServer({
      requestListener: this.application.requestListener,
      port: normalizePort(port),
    });
  }
}

module.exports = Container;
