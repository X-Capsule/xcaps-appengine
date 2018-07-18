const http = require('http');
const romensLogging = require('xcaps-logging');

const { ConsoleHandler } = romensLogging;

const logger = romensLogging.getLogger('AppEngine.server');
const infoConsoleHandler = new ConsoleHandler('infoConsoleHandler', 'info');
const errorConsoleHandler = new ConsoleHandler('errorConsoleHandler', 'error');

logger.addHandler(infoConsoleHandler);
logger.addHandler(errorConsoleHandler);

// const https = require('https');  // reserved

/**
 * @function onListeningHandler
 * @description Event listener for HTTP server "listening" event.
 * @param {object} options
 * @param {object} options.server - Server instance
 * @returns {function(*)}
 */
function onListeningHandler(options) {
  return () => {
    const { server } = options;
    const address = server.address();
    const bind = typeof address === 'string'
      ? `pipe ${address}`
      : `port ${address.port}`;
    logger.log('info', `Listening on ${bind}`);
  };
}


/**
 * @function onErrorHandler
 * @description Event listener for HTTP server "error" event.
 * @param {object} options
 * @param {string} options.port - http server port
 * @returns {function(*)}
 */

function onErrorHandler(options) {
  return (error) => {
    logger.error(error.message, { error });
    if (error.syscall !== 'listen') {
      throw error;
    }
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        // console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        // console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  };
}

/**
 * @class HttpServer
 * @description simple http-based class of app server. 主要用于将 node http module
 * 以 class 形式封装. 并提供一组基于 Http 的服务接口.
 */
class HttpServer {
  /**
   * @method constructor
   * @param {object} options
   * @param {function} options.requestListener - requestListener is a function
   * which is automatically.
   * added to the 'request' event.
   * @param {string || number} options.port - server port
   */
  constructor(options = {}) {
    const { requestListener, port } = options;
    logger.log('info', 'Create HTTP server');
    this.server = http.createServer(requestListener);
    logger.log('warn', `Server Port: ${port}`);
    this.port = port;
  }

  /**
   * @method run
   * @description run http server
   * @param {Object} options - 运行参数.
   */
  run(options = {}) {
    const {
      server,
      port,
    } = this;
    server.listen(port);
    /**
     * onErrorHandler 和 onListeningHandler 暂且不对外开放定义.
     */
    server.on('error', onErrorHandler);
    server.on('listening', onListeningHandler);
  }
}

/**
 * @class HttpsServer (reserved)
 * @description simple https-based class of app server. 主要用于将 node https module
 * 以 class 形式封装. 并提供一组基于 Https 的服务接口.
 */

class HttpsServer {}

module.exports = {
  HttpServer,
  HttpsServer,
};
