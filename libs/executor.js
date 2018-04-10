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

    let driver;

    let userOptions={
        headless:true,
        tryTimes:3
    }
    function init(options) {
        //copy to the userOptions
        for (let child in options){
            userOptions[child]=options[child];
        }
        //init
        let browserOptions=new Options();
        if (userOptions.headless)
            browserOptions.headless();
        browserOptions.setPreference('permissions.default.image',2);
        driver=new webDriver.Builder().forBrowser(browser).setFirefoxOptions(browserOptions).build();
        driver.get('about:blank');
    }
    //id of first window
    let firstTabId;
    //close winddow timer
    let waitForClose=[];
    let closeTimer;
    let closeTimerExecuting=false;
    //driver lock
    let driverInUsed=false;

    async function closeTimerFunc(){
        if (!driverInUsed){
            driverInUsed=true;
            //continue
            let tmp=waitForClose.shift();
            if (tmp){
                //do some thing for this tab
                if (tmp.exec){
                    await tmp.exec().catch(()=>{

                    });
                }
                else
                {
                    //close this tab
                    await driver.switchTo().window(tmp.id);
                    await driver.close();
                    await driver.switchTo().window(firstTabId);
                }
            }else{
                //there are no window wait for closing
                //check running window
                let handles = await driver.getAllWindowHandles();
                if (handles.length==1){
                    clearInterval(closeTimer);
                    closeTimer=null;
                }
            }
            driverInUsed=false;
        }
    }

    function openContent(url, func, doneFunc) {
        return new Promise(async (resolve, reject) => {
            //wait for driver
            while (driverInUsed) {
                await new Promise((resolve, reject) => {
                        setTimeout(() => {
                            resolve();
                        }, 100)
                    });
            }

            driverInUsed = true;
            let contentOpening = true;

            //open a new window
            await driver.executeScript(() => {
                let url = arguments[0];
                window.open('about:blank', '_blank');
            }, url);

            //open the timer if it is not run
            if (!closeTimer) {
                closeTimer = setInterval(closeTimerFunc, 150);
            }

            //switch to the new window
            let handles = await driver.getAllWindowHandles();
            let thisWindow = handles[1];
            if (!firstTabId)
                firstTabId = handles[0];
            await driver.switchTo().window(thisWindow)

            //execute script
            function execInBrowser() {
                let tmpFunc = eval(arguments[0]);
                let cb = arguments[arguments.length - 1];
                document.ready = () => {
                    tmpFunc(cb);
                }
            }

            function execThen(param) {
                //wait for the tab switch back and resolve of callback
                let timer = setInterval(() => {
                    if (!contentOpening) {
                        clearInterval(timer);
                        //if has doneFunc, resolve is called, only call doneFunc
                        if (doneFunc)
                            doneFunc(param, () => {
                                waitForClose.push({
                                    id: thisWindow
                                })
                            }, (getUrl, newFunc) => {
                                waitForClose.push({
                                    exec: async () => {
                                        let urlInner=getUrl();
                                        if (urlInner) {
                                            //switch to the window
                                            await driver.switchTo().window(thisWindow);
                                            //start
                                            let funcCurrent = newFunc ? newFunc : func;
                                            let result=await retry(urlInner,funcCurrent);

                                        } else {
                                            waitForClose.push({id: thisWindow});
                                        }
                                    }
                                })
                            });
                        else {
                            resolve(param);
                            waitForClose.push({
                                id: thisWindow
                            })
                        }
                    }
                }, 100);
            }

            async function retry(url,funcToExec){
                async function retryInner(){
                    await driver.get('about:blank');
                    await driver.executeScript(() => {
                        let url = arguments[0];
                        window.location.replace(url);
                    }, url);
                    //wait for loading
                    await driver.wait(until.elementLocated(By.xpath('//script')), 3000);
                    await driver.executeAsyncScript(execInBrowser, funcToExec).then(execThen);
                    return true;
                }
                for (let i=0;i<userOptions.tryTimes;i++){
                    let result=await retryInner().catch(()=>{});
                    if (result){
                        //execute success
                        return true;
                    }
                    console.log('Error,retry!');
                }
                console.log('Try for '+userOptions.tryTimes+' times, fail!');
                return false;
            }

            let result=await retry(url,func);


            await driver.switchTo().window(firstTabId);

            //execute done
            contentOpening = false;
            driverInUsed = false;
            //if has doneFunc, resolve
            if (doneFunc)
                resolve();
        })
    }

    function openSomeContent(urls,func,max,done,error){
        return new Promise(async (resolve,reject)=>{
            let nowIndex=0;
            let inExec=0;
            function getItem(index){
                if(urls instanceof Array)
                    return urls[index]
                else if(urls.get)
                    return urls.get(index)
            }

            async function openSomeContentInner(index){
                let indexNative=index;
                await openContent(getItem(index),func,(param,close,next)=>{
                    done({
                        index:indexNative,
                        data:param
                    });
                    next(()=>{
                        nowIndex++;
                        if (nowIndex<urls.length){
                            indexNative=nowIndex;
                            return getItem(nowIndex);
                        }
                        else{
                            inExec--;
                            if (inExec==0)
                                resolve();
                            return null;
                        }
                    })
                }).catch(()=>{
                    console.log('error')
                });
            }

            let maxTmp=max>urls.length?urls.length:max;
            for(nowIndex=0;nowIndex<maxTmp;nowIndex++){
                await openSomeContentInner(nowIndex);
                inExec++;
            }
            nowIndex--;
        });
    }

    //write into crawler
    crawler.init=init;
    crawler.openContent=openContent;
    crawler.openSomeContent=openSomeContent;
    //return js to eval
    return jsContent;
})());
