const crawler={};

eval((function (){
    let args = process.argv.splice(2)
    //check browser
    const browser=args[0];
    if (browser!='firefox'&&browser!='chrome'){
        console.log('Not support browser!');
        return '';
    }
    //check js
    const path=require('path');
    const fs=require('fs');
    const jsPath=path.join(__dirname,'../js/'+args[1]);
    if (!fs.existsSync(jsPath)){
        console.log('Js file not exist!');
        return '';
    }
    const jsContent=fs.readFileSync(jsPath).toString();

    const webDriver=require('selenium-webdriver');
    const By=webDriver.By;
    const until=webDriver.until;
    const Options=require('selenium-webdriver/'+browser).Options;
    const Queue=require('promise-queue-plus');
    const q=Queue.Promise;

    let driver;

    function init(headless) {
        let options=new Options();
        if (headless)
            options.headless();
        driver=new webDriver.Builder().forBrowser(browser).setFirefoxOptions(options).build();
    }

    async function openContent(url, func) {
        return new Promise(async (resolve,reject)=>{
            await driver.executeScript(() => {
                let url = arguments[0];
                window.open(url, '_blank');
            }, url);
            //switch to the new window
            let handles = await driver.getAllWindowHandles().catch(()=>{
                console.log('Error when getAllWindowHandles');
            });
            await driver.switchTo().window(handles[1]).catch(()=>{
                console.log('Error when switch the tab to index 1');
            });
            //wait for loading
            let body = await driver.wait(until.elementLocated(By.xpath('//script')), 5000).catch(()=>{
                console.log('Error when wait for the first script element appended');
            });
            //execute script
            await driver.executeAsyncScript(() => {
                let tmpFunc = eval(arguments[0]);
                let cb = arguments[arguments.length - 1];
                document.ready = () => {
                    tmpFunc(cb);
                    setTimeout(() => {
                        window.close();
                    }, 1000);
                }
            }, func).then(async (param) => {
                resolve(param);
            }).catch(()=>{
                console.log('Error when execute script in web content');
            });
            await driver.switchTo().window(handles[0]).catch(()=>{
                console.log('Error when switch the tab back to index 0');
            });
        });
    }

    async function openSomeContent(urls,func,max,done){
        return new Promise(async (resolve,reject)=>{
            let inExec=0;
            let nowIndex=0;
            function getItem(index){
                if(urls instanceof Array)
                    return urls[index]
                else if(urls.get)
                    return urls.get(index)
            }

            async function openSomeContentInterval(index){
                let data=await openContent(getItem(index),func);
                done({
                    index:index,
                    data:data
                });
                inExec--;
            }

            let maxTmp=max>urls.length?urls.length:max;
            for(nowIndex=0;nowIndex<maxTmp;nowIndex++){
                await openSomeContentInterval(nowIndex);
                inExec++;
            }
            nowIndex--;
            let running=false;
            let timer=setInterval(async ()=>{
                if (!running){
                    running=true;
                    if (inExec<max){
                        inExec++;
                        nowIndex++;
                        if (nowIndex<urls.length){
                            await openSomeContentInterval(nowIndex);
                        }else{
                            clearInterval(timer);
                            resolve();
                        }
                    }
                    running=false;
                }
            },100);
        });
    }

    //write into crawler
    crawler.init=init;
    crawler.openContent=openContent;
    crawler.openSomeContent=openSomeContent;
    //return js to eval
    return jsContent;
})());
