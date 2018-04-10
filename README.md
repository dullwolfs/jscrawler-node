## jscrawler-node
A easy-to-use crawler frame for node, based on [**selenium-webdriver**](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver). It is still in development. You don't need to deploy the browser driver of selenium-webdriver manually.

一个为node提供的非常容易使用的爬虫框架，基于[**selenium-webdriver**](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver)。目前还正在开发。您不需要再手动为selenium-webdriver去部署浏览器驱动。

### Problem

There are also some problems in project.
该工程仍然存在一些问题。
- Chrome Support
>Project provide chrome driver, but all the functions are only highly compatible with firefox in this version.
>
>项目提供了chrome的驱动，但目前版本的所有功能仅高度支持firefox。
- Memory Leak
>Memory will be consumed in large quantities if you have opened very large number of page.
>
>如果您打开了过大量页面，内存将会大量消耗。

jsrawler-node contain some of them:

jscawler-node 包含了一部分驱动：
```js
const support={
    chrome:{
        windows:'win32',
        linux:'linux64',
    },
    firefox:{
        windows:'win64',
        linux:'linux64'
    }
}
```
### Get Started

#### Installation
You should install nodejs/git before installation.

您应该在安装前安装nodejs/git。
```bash
git clone https://github.com/flyingf0x/jscrawler-node.git
cd jscrawler-node/
npm install
```
#### Configure
open prop/main.json
```json
{
  "browser":"firefox",
  "main":"main.js"
}
```
- **browser**
>Which browser do you want. Only support firefox and chrome.
>
>您需要使用的浏览器，只支持firefox与chorme。
- **main**
>Which js do you want execute which is in jscrawler-node/js folder.
>
>您需要执行的js文件，它需要被放置在jscrawler-node/js目录。

#### Coding
Write your code into the file what you configure.

在您所配置的js文件中编写代码

#### Run
Run this command in the project's root directory.

在项目的根目录运行命令。
```bash
npm run start
```

### Explian
Startup process like this:
启动流程如下：
- **bin/loader.js**
>Read prop/main.js. Call child_process.spwan() to set PATH and run libs/executor.js.
>
>读取prop/main.js。 通过child_process.spwan()设置PATH，随后执行libs/executor.js。
- **libs/executor.js**
>Prepare the running environment, read user's js and eval() it.
>
>准备运行环境，读取用户js并用eval()执行。
- **user's js**
>Start running.
>
>开始运行

You can write your js just like wrting a node program with some APIs from executor.js

您可以像写node应用一样编写您的代码，并且使用executor.js提供的一些API

### APIs
libs/executor.js provide a object **crawler**, and it contains some functions.

libs/executor.js 提供一个**crawler**对象，它包含了一些方法。

#### Notice
They are async function by promise. If you call multiple function at the same time, for safety you must call them with **await**.

他们都是通过promise实现的异步方法，如果您需要同时调用多次，为了安全请务必使用**await**
#### crawler.init
```js
crawler.init({
	headless:true,
    tryTimes:3
})
```
This function will create a browser window, you should call it first.

该方法将会创建一个浏览器窗口，您应该最先调用他.
- **headless** Boolean auto:true
>is opening browser in headless mode(no GUI)
>
>是否让浏览器运行在headless模式(无 GUI)
- **tryTimes** Number auto:3
>max retries per url
>
>每个链接最大尝试次数

#### crawler.openContent
```js
let result=await crawler.openContent(
	'url',
    (end)=>{},
    (param,close,next)=>{}
    )
```
- **url** String
>What url do you want to open
>
>您想要打开的url
- **(end)=>{}** Function
>This function will be send to the remote web content and execute it,you can use window/document directly.
>You shoud call end() at the end of function, or with a param if necessary, param will be return from openContent.
>You also can catch result in then() if whithout await.
>
>该方法将会被发送到浏览器端进行执行，您可以直接使用window/document。
>您应该在方法结束时调用end()，或者给予一个参数如果您需要的话，参数将会被作为openContent的返回值。
>当然如果您没有使用await,也可以在then()中获得返回结果。
- **(param,close,next)=>{}** Function
>If you provide this arg,function will call resolve() when the window opened,and when remote script executed, it will be call back.
>
>如果您提供该参数，该方法将会在窗口打开后调用resolve(),浏览器脚本执行完毕后，此方法将会被回调。
> - **param** ...
> >result from remote browser script
> >
> >浏览器脚本执行结果
> - **close** Function
> >A function wll close this window
> >
> >关闭该窗口的方法
> - **next** Function
> >A function let the window continue opening the next url and execute script. If not provide next function, the **(end)=>{}** will be used again.
> >
> >让窗口继续打开下一个页面，并且执行脚本的方法，如果不提供下一个页面执行的代码，**(end)=>{}** 将会被再一次使用。
> >```js
> >next(()=>{
> >    return nextUrl;
> >},()=>{
> >    //next function will execute in remote browser
> >});
> >```

#### crawler.openSomeContent
```js
await crawler.openSomeContent(
	urls,
    (end)=>{},
    max,
    (done)=>{}
)
```
- **urls** Array/Object
>A array of String contain all url, or a object like this:
>
>一个字符串数组包含所有的url，或者一个像这样的对象：
```js
{
	get:(index)=>{
    	return 'url';
    },
    length:100
}
```
- **(end)=>{}** Function
>Same as the **arguments[1]** in function **openContent** except the return data.
>
>除了返回数据，其他与 **openContent** 的中的 **arguments[1]** 相同。
- **max** Number
>max concurrency
>
>最大并发
- **(done)=>{}** Function
>when you call end() in remote web content,this function will be called，and the param of end() can be got.
>done is a object like this:
>
>当您调用在浏览器端调用end()时，该方法将会被调用，end()传递的参数也能被获取到。
>done是一个像这样的对象：
```js
{
	index:10,
    data:paramData
}
```