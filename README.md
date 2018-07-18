# Romens B2B E-Commerce System Project
[![Project Version][project-image]][project-url]
[![Test Coverage][coveralls-image]][coveralls-url]

## 设计思路：
- 运维层面：不同功能App分组部署
- 开发层面：
    - 分层解耦
    - 易于扩展
    - 领域驱动设计
    

### 1.运维

![](http://on-img.com/chart_image/5a6a877ee4b022101d0f476a.png)

`WebApplication`类的`static`方法`combineSubApps`，首先生成一个express实例，作为其他需要加载app的父对象。
实际上，express()返回的对象本质上就是一个function(req, res, next)函数，express源码内部对通过app.use传入的参数
做了区分：
   - 对于普通的中间件处理函数，会push到一个数组里面；
   - 对于不是普通的中间件函数的参数，express源码会对参数做一个遍历，将每个app作为父对象的继承对象，因此这里可以把报文传给子模块处理 

参考：

[express源码解析1](http://blog.hacking.pub/2017/02/16/express-js-yuan-ma-chu-tan/)

[express源码解析2](http://blog.hacking.pub/2017/03/22/express-js-yuan-ma-si-tan-applicationpian/)
### 2.开发
app的开发架构参考了领域驱动设计的思想，可以从以下两种方式来理解：

#### 2.1 领域驱动设计的层级架构(Layered Archetecture)
参考图：

![](http://images.cnitblog.com/kb/1/201402/091455367551856.png)

b2b2.0架构层级图：

![](http://on-img.com/chart_image/5a6a8d29e4b0c74dfe59d291.png)
- 用户接口层：负责向用户显示信息，并且解析用户命令。外部的执行者有时可能会是其他的计算机系统，不一定非是人。
例如：在支付业务系统中，对应的是：`apps/paymentSystem/port/adapter/swaggerApis`。

- 应用层：定义软件可以完成的工作，并且指挥具有丰富含义的领域对象来解决问题。这个层附负责的任务对业务影响深远，对跟其他系统的应用层进行交互
非常必要。这个层要保存简练。它不包括处理业务规则或知识。只是给下一层中相互协作的领域对象协调任务、委托工作。在这个层次中不反映业务情况的状态，
但反映用户或程序的任务进度的状态。例如：在支付业务系统中，对应的是：`apps/paymentSystem/application`

- 领域层：负责表示业务概念、业务状况的信息以及业务规则。尽管保存这些内容的技术细节由基础结构层兰完成。反映业务在的状态在该层中被控制和使用。
这一层是业务软件的核心。例如：在支付业务系统中，对应的是：`apps/paymentSystem/domain`

- 基础结构层：为上册提供通用的技术能力；应用的消息发送、领域持久化，为用户加盟绘制窗口等。提供架构框架，基本结构层还可以支持这四层之间的交互模式
例如：在支付业务系统中，对应的是：`apps/paymentSystem/port/adapter/persistence`


注：本项目里面的 `用户接口层`和`基础结构层`的命名方式和放置路径参考了`领域驱动设计`的`六边形架构`设计。`六边形架构`中将与业务处理单元（应用程序）无关的
用来与其他系统交互的接口层称为`适配器（adapter）`，适配器统一放在`port`目录下。

#### 领域模型中相关名词解释：
 - 实体（entity）:用唯一的标识符来定义，而不是通过属性来定义的对象。即使属性完全相同也可能是两个不同的对象。
 - 值对象（value Object）:用于描述领域的某个方面本身没有概念标识的对象，值对象被实例化后只是提供值或叫设计元素，我们只关心这些设计元素是什么？
 而不关心这些设计元素是谁。书里面谈到颜色，数字是常见的值对象
 - objectDescriptor: 用于根据不同的业务需求对领域对象属性值的组装
 
 [实体和值对象的解释1](http://blog.csdn.net/weixin_38070406/article/details/78728246)
 
 [实体和值对象的解释2](http://blog.csdn.net/lijingyao8206/article/details/50493983)
 
 [实体和值对象的解释3](https://www.cnkirito.moe/2017/07/28/Re：从零开始的领域驱动设计)


#### 2.2 领域驱动设计的六边形架构

参考图：

![](https://images2017.cnblogs.com/blog/849051/201709/849051-20170909215810960-1659673125.png)

![](http://insights.thoughtworkers.org/wp-content/uploads/2017/06/3-application.jpg)

b2b2.0六边形架构实现图：

![](http://on-img.com/chart_image/5a6ac0c5e4b0c74dfe5a6a7d.png)

六边形架构（Hexagonal Architecture），又称为端口和适配器架构风格，其中的“六”具体数字没有特殊的含义，仅仅表示一个“量级”的意思，六边形的定义只是方便更加形象的理解。

六边形架构，一般会分成三层：

- 领域层（Domain Layer）：最里面，纯粹的核心业务逻辑，一般不包含任何技术实现或引用。

- 端口层（Ports Layer）：领域层之外，负责接收与用例相关的所有请求，这些请求负责在领域层中协调工作。端口层在端口内部作为领域层的边界，在端口外部则扮演了外部实体的角色。
例如：在支付系统中，`端口层`对应的是：`apps/paymentSystem/application`

- 适配器层（Adapters Layer）：端口层之外，负责以某种格式接收输入、及产生输出。比如，对于 HTTP 用户请求，适配器会将转换为对领域层的调用，
并将领域层传回的响应进行封送，通过 HTTP 传回调用客户端。在适配器层不存在领域逻辑，它的唯一职责就是在外部世界与领域层之间进行技术性的转换。
适配器能够与端口的某个协议相关联并使用该端口，多个适配器可以使用同一个端口，在切换到某种新的用户界面时，可以让新界面与老界面同时使用相同的端口。
例如：在支付系统中，`适配器层`对应的是：`apps/paymentSystem/port/adapter`，`port`即端口，意指各适配器层通往业务核心领域层的入口,
`adapter`相对于领域层，位于端口外部

[六边形架构演进参考1](http://www.cnblogs.com/xishuai/p/iddd-soa-rest-and-hexagonal-architecture.html)

[六边形架构演进参考2](http://insights.thoughtworks.cn/from-sandwich-to-hexagon/)

## 2. Context 模块

`context` 是为了解决模块调用栈参数传递的问题, 可以让模块具备上下文能力. 以便可以更好的通过 `context` 来让模块内部功能访问模块间传递的信息.

### 1.1. Class SessionContextProvider

`SessionContextProvider` 是让功能模块具备**会话上下文**的功能.

#### 1.1.2. static getClassSessionContext(object)

获取 `sessionContext` 实例:

```
const sessionContext = SessionContextProvider.getClassSessionContext(yourInstanceObject);
```

#### 1.1.3. Static bindClassSessionContext(ClassObject, contextData)

将 `sessionContext` 绑定到你的类上.

```
SessionContextProvider.bindClassSessionContext(YourClass, contextData);
```

### 1.2. Class SessionContext

以下是 `SessionContext` 拥有的一些方法. 更多请参考源代码.

通过一下方式获取 sessionContext 值, 举例说明
```
	 const sessionContext = SessionContextProvider.getClassSessionContext(this);
```

* 获取全部 `contextContent` 的信息: 使用 `sessionContext.contextContent` 来获取
* 通过 `key` 来获取 `context` 内容: 使用 `sessionContext.getContextValue('your key')` 来获取

#### 以下为源代码参考
```
...
class SessionContext {
  ...

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
...
```

#### 关于 Session Context 的使用方法
目前, `SessionContext` 可以在类定义中使用. 目前, 推荐在服务上下文中使用. 例如:

```
const { SessionContextProvider } = require('rms-appengine');
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

```  

### 1.2. ApplicationContextProvider
`ApplicationContextProvider` 是在 `Web Application` 中使用. 目前, 建议在 `WebApplication` 的 	`app` 中使用, 或者可以在 `Swagger`的 `controllers` 中使用

**NOTE:** 该模块不强制使用.

#### 1.2.1 static createApplicationContext(context)
`createApplicationContext` 方法用于创建应用上下文信息.

```
const { ApplicationContextProvider } = require('rms-appengine');
const applicationContext = ApplicationContextProvider.createApplicationContext({
	// your context content
});
```
#### 1.2.2 static getApplicationContext()

`createApplicationContext` 方法用于创建应用上下文信息.

```
const { ApplicationContextProvider } = require('rms-appengine');
const applicationContext = ApplicationContextProvider.getApplicationContext();
```
### 1.3. Class ApplicationContext

* 方法 `getContextValue(key)`: 通过指定 `key` 值获取对应的 `context` 信息.
* 方法 `setContextValue(val)`: 设置 context 值.

源代码

```
...
class ApplicationContext {
  ...
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
...
```
 
[project-image]: https://img.shields.io/badge/package-release--v1.3.0-blue.svg
[project-url]: project-url

[coveralls-image]: https://img.shields.io/badge/coverage-0%25-red.svg
[coveralls-url]: coveralls-url

