
class AppEngineManager {
  /**
   * @description 运行 container
   * @param {function} prepareContainer - application container.
   * @param {Object} options - 运行时提供的参数
   */
  static async run(prepareContainer, options = {}) {
    const container = await prepareContainer();
    container.runContainer(options);
  }
}

module.exports = AppEngineManager;
