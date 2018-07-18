const ApplicationContext = require('./ApplicationContext');

let applicationContext = null;

class ApplicationContextProvider {
  static createApplicationContext(context) {
    applicationContext = new ApplicationContext(context);
    return applicationContext;
  }
  static getApplicationContext() {
    return applicationContext;
  }
}

module.exports = ApplicationContextProvider;
