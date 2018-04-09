## jscrawler-node
A easy-to-use crawler frame for node, based on [**selenium-webdriver**](seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver). You don't need to deploy the browser driver of selenium-webdriver.
####jsrawler-node contain some of them:
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
- **browser** Which browser do you want. Only support firefox and chrome.
- **main** Which js do you want execute in jscrawler-node/js folder.

#### Coding
Write your code into the file what you configure.

#### Run
Run this command in the root directory.
```bash
npm run start
```

### Explian
Startup process like this:
- **bin/loader.js** Read prop/main.js. Call child_process.spwan() to set PATH and run libs/executor.js.
- **libs/executor.js** Prepare the running environment, read user's js and eval() it.
- **user's js** Start running.

You can write your js just like wrting on node with some APIs from executor.js

### APIs
libs/executor.js provide a object **crawler**, and it contains some functions.

#### Notice
All of them are **async** function. If you call multiple function, for safety you should call them with **await**.
#### crawler.openContent
```js
let result=await crawler.openContent(
	'url',//What url do you want to open
    (end)=>{
    	//This function will send to the remove web content and execute it,you can use window/document directly.
        //You shoud call end at the end of function, or with a result if necessary.Result will be return from openContent.
    })
```

#### crawler.openSomeContent
```js
await crawler.openSomeContent(
	urls,//A array of String contain all url, or a object like {length:5,get:(index)=>{return 'url'}}
    (end)=>{
    	//same as the second param in function openContent
    },
    max,//max concurrency
    (done)=>{
    	//when you call end(param) in remote web content,this function will be called.
        //done is a object contain index(url's index) and data(what you push into end())
    }
)
```
