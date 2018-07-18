const ExpressApplication = require('express');
const _ = require('lodash');
const { ApplicationContextProvider } = require('./context');
const utils = require('xcaps-utils');
const path = require('path');

const DefaultApplicationEngine = ExpressApplication;
/**
 * @class WebApplication
 * @description 该类主要用于封装框架型 Application(例如 expressjs 等框架), 该类将通过
 * 实例化后, 将被 AppEngine 的 Container 使用. 这里统一了 Application 的规范调用.
 */
class WebApplication {
  /**
   * @method constructor
   * @param {Object} options
   * @param {Object} [options.appEngine] - application engine instance. (例如 express.js)
   */
  constructor(options = {}) {
    this.configurationFiles = [];
    const { appEngine } = options;
    /**
     * 默认集成 Expressjs WebFramework 来封装应用类.
     */
    this.setWebApplication(appEngine);
    this.initialize();
    this.initApplicationContext();
  }

  /**
   * @method setConfigurationFiles
   * @description 该方法只能在 initialize 方法中使用.
   * @param files
   */
  setConfigurationFiles(files) {
    this.configurationFiles = _.union(this.configurationFiles, files);
  }

  /**
   * @description 初始化 application context 信息.
   */
  initApplicationContext() {
    this.applicationContext = ApplicationContextProvider.createApplicationContext({});
    /**
     * 读取应用相关配置文件, 并将设置 application 配置信息写入 application context.
     */
    _.forEach(this.configurationFiles, (file) => {
      const configuration = utils.yaml.load({
        filePath: path.join(this.configurationFilePath, file),
      });
      _.mapKeys(configuration, (val, key) => {
        this.applicationContext.setContextValue(key, val);
      });
    });
  }
  /**
   * @description 设置配置文件路径
   * @param {string} filePath
   */
  setConfigurationFilePath(filePath) {
    this.configurationFilePath = filePath;
  }
  /**
   * @description 设置应用引擎, 默认将其引擎设置为 Express.js.
   * @param {Object} appEngine
   */
  setWebApplication(appEngine) {
    this.app = !_.isEmpty(appEngine) ? appEngine : DefaultApplicationEngine();
  }

  /**
   * @description 获取 Web application instance
   * @return {*|Function}
   */
  getWebApplication() {
    return this.app;
  }

  /**
   * @description 该方法为用户自定义初始化应用的方法.
   */
  // eslint-disable-next-line class-methods-use-this
  initialize(app) {
    /**
     * override this method.
     */
  }

  /**
   * @property requestListener
   * @description 该方法用于提取 expressjs application instance 作为 Node.js Http
   * createServer 的 requestListener handler.
   * @return {*|Function}
   */
  get requestListener() {
    return this.app;
  }

  /**
   * @static combineSubApps
   * @description 该方法用于加载合并多个 sub applications 应用.
   * @param options
   */
  static combineSubApps(options = {}) {
    const { apps } = options;
    const appInstances = _.map(apps, 'app');
    const webApp = new WebApplication();
    const appInstance = webApp.app;
    /**
     * 利用 express combine 机制, 将多个 apps 合并到一个 app instance 中去.
     */
    appInstance.use(appInstances);
    return webApp;
  }
}

module.exports = WebApplication;
