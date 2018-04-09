(async function(){
    const fs=require('fs');
    const path=require('path');
    crawler.init(true);
    const pageUrl='http://www.qingyy.net/App/index/p/';
    //获取最大页数
    let max=await crawler.openContent(pageUrl+1,(callback)=>{
        //获取最大页数
        let tmp=document.getElementsByClassName('disabled')[0].parentNode;
        let max=tmp.children[tmp.children.length-1].children[0].innerText;
        callback(max);
    });
    console.log(max);

    let appList = [];
    await crawler.openSomeContent({
        get: (index) => {
            return pageUrl + index;
        },
        length: 10
    }, (callback) => {
        let parent = document.getElementById('thelist').children;
        let appList = []
        for (let item of parent) {
            appList.push(item.href);
        }
        callback(appList)
    }, 5, (list) => {
        console.log('list '+(list.index+1)+'/'+max);
        appList = appList.concat(list.data);
    })
    console.log('all list Done');
    let data=[];
    await crawler.openSomeContent(appList,(callback)=>{
        let inner={};
        let titleBox = document.getElementsByClassName('dataList fl')[0];
        let infoBox = document.getElementsByClassName('lite-text fl')[0].children[2];
        let codeBox = document.getElementsByClassName('lite-code fr')[0];
        //获取名字
        let name=titleBox.children[0].children[0].innerText;
        inner.name=name;
        //获取图标
        let imgUrl = document.getElementsByClassName('img fl')[0].children[0].src;
        inner.imgUrl = imgUrl;
        //获取标签
        let tap = [];
        let tapArr = titleBox.children[2].children;
        for(let i of tapArr){
            tap.push(i.children[0].innerText);
        }
        inner.tap = tap;
        //获取作者信息
        let author = infoBox.children[0].innerText;
        inner.author = author;
        //获取发布时间
        let time = infoBox.children[1].innerText;
        inner.time = time;
        //获取要求信息
        let request = infoBox.children[2].innerText;
        inner.request = request;
        //获取小程序二维码
        let appCode = codeBox.children[0].children[0].src;
        inner.appCode = appCode;
        //获取公众号二维码
        let publicCode = codeBox.children[1].children[0].src;
        inner.publicCode = publicCode;
        //获取介绍内容
        let desc = document.getElementsByClassName('detaltext')[0].children[2].innerText;
        inner.desc = desc;
        callback(inner);
    },30,(inner)=>{
        console.log('app '+(inner.index+1)+'/'+appList.length)
        data.push(inner);
    })
    console.log('app all done,writing');
    fs.writeFileSync('/home/ghost/crawler.json',JSON.stringify(data));
})();