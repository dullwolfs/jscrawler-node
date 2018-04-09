## jscrawler-node
A easy-to-use crawler frame for node, based on **selenium-webdriver**. You don't need to deploy the browser driver of selenium-webdriver.
####jsrawler-node contain some of drivers.
```json
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
$ git clone https://github.com/flyingf0x/jscrawler-node.git
$ cd jscrawler-node/
$ npm install
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
execute this command in the root directory.
```bash
npm run start
```