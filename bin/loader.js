const child_process=require('child_process');
const os=require('os');
const fs=require('fs');
const path=require('path');

const jsonPath=path.join(__dirname,'../prop/main.json')
const driverPath=path.join(__dirname,'../drivers')

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

function readData(){
    let str='{}';
    if (fs.existsSync(jsonPath))
        str=fs.readFileSync(jsonPath);
    return JSON.parse(str);
}

function getDriverPath(data){
    let tmpA=support[data.browser];
    if(tmpA){
        let tmpB=tmpA[os.platform()];
        if (tmpB){
            return driverPath+'/'+data.browser+'/'+tmpB;
        }
    }
}

function getCmdLine(path,main) {
    let cmd='';
    if (path&&main){
        if (os.platform()=='linux'){
            cmd+='export PATH=$PATH:'+path+'&&';
        }else if (os.platform()=='windows'){
            cmd+='set PATH=%PATH%:'+path+'&&';
        }
        cmd+='node libs/executor.js '+data.browser+' '+main;
    }
    return cmd;
}
let data=readData();
let cmd=getCmdLine(getDriverPath(data),data.main);
if(cmd){
    let shell=os.platform()=='windows'?'cmd':os.platform()=='linux'?'bash':'';
    if (shell){
        let pro=child_process.spawn(shell,['-c',cmd]);
        process.stdin.pipe(pro.stdin);
        pro.stdout.pipe(process.stdout);
        pro.stderr.pipe(process.stderr);
        pro.on('exit',()=>{
            process.exit(0);
        })
    }
}else{
    console.log('Load fail, please check prop/main.json and make sure that your os is windows[x86/x64] or linux[x64]');
}

