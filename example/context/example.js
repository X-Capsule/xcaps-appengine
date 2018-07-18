const { SessionContextProvider } = require('../../index'); // require('rms-appengine')

class ServiceC {
  constructor() {
    this.sessionContext = SessionContextProvider.getClassSessionContext(this);
  }
  foo() {
    console.log(this.sessionContext.contextContent);
  }
}

class ServiceB {
  constructor() {
    this.sessionContext = SessionContextProvider.getClassSessionContext(this);
    this.sessionContext.setContextValue({
      dataB: 1,
    });
  }

  callServiceBFoo() {
    const contextContent = Object.assign({}, this.sessionContext.contextContent, { dataC: 1 });
    const ServiceCClass = SessionContextProvider.bindClassSessionContext(ServiceC, contextContent);
    const serviceC = new ServiceCClass();
    serviceC.foo();
  }

  callServiceBBar() {
    console.log(this.callServiceBBar);
    const ServiceCClass = SessionContextProvider
      .bindClassSessionContext(ServiceC, Object.assign({}, { dataC: 2 }));
    const serviceC = new ServiceCClass();
    serviceC.foo();
  }
}

class ServiceA {
  testContext() {
    console.log(this.testContext);
    const contextContent = {
      dataC: 1,
    };
    const ServiceBClass = SessionContextProvider.bindClassSessionContext(ServiceB, contextContent);
    const serviceB = new ServiceBClass();

    serviceB.callServiceBFoo();
    serviceB.callServiceBBar();
  }
}

const serviceA = new ServiceA();
serviceA.testContext();
