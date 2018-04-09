## jscrawler-node
A easy-to-use crawler frame for node, based on [**selenium-webdriver**](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver). It is still in development. You don't need to deploy the browser driver of selenium-webdriver.

一个为node提供的非常容易使用的爬虫框架，基于[**selenium-webdriver**](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver)。目前还正在开发。你不需要为selenium-webdriver去部署浏览器驱动。

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
You should install nodejs first.

你应该先安装nodejs。
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
>你需要使用的浏览器，只支持firefox与chorme。
- **main**
>Which js do you want execute which is in jscrawler-node/js folder.
>
>你需要执行的js文件，它需要被放置在jscrawler-node/js目录。

#### Coding
Write your code into the file what you configure.

在你所配置的js文件中编写代码

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

你可以像写node应用一样编写你的代码，并且使用executor.js提供的一些API

### APIs
libs/executor.js provide a object **crawler**, and it contains some functions.

libs/executor.js 提供一个**crawler**对象，它包含了一些方法。

#### Notice
All of them are **async** function. If you call multiple function at the same time, for safety you must call them with **await**.

所有方法都是**async**方法，如果你需要同时调用多次，为了安全请务必使用**await**
#### crawler.openContent
```js
let result=await crawler.openContent(
	'url',
    (end)=>{}
    )
```
- **arguments[0]** url
>What url do you want to open
>
>你想要打开的url
- **arguments[1]** (end)=>{}
>This function will send to the remove web content and execute it,you can use window/document directly.
>You shoud call end at the end of function, or with a param if necessary, param will be return from openContent.
>You also can catch result in then() if whithout await.
>
>该方法将会被发送到浏览器端进行执行，你可以直接使用window/document。
>你应该在方法结束时调用end()，或者给予一个参数如果你需要的话，参数将会被作为openContent的返回值。
>当然如果你没有使用await,也可以在then()中获得返回结果。

#### crawler.openSomeContent
```js
await crawler.openSomeContent(
	urls,
    (end)=>{},
    max,
    (done)=>{}
)
```
- **arguments[0]** urls
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
- **arguments[1]**
>Same as the **arguments[1]** in function **openContent** except the return data.
>
>除了返回数据，其他与 **openContent** 的中的 **arguments[1]** 相同。
- **arguments[2]**
>max concurrency
>
>最大并发
- **arguments[3]**
>when you call end() in remote web content,this function will be called，and the param of end() can be got.
>done is a object like this:
>
>当你调用在浏览器端调用end()时，该方法将会被调用，end()传递的参数也能被获取到。
>done是一个像这样的对象：
```js
{
	index:10,
    data:paramData
}
```