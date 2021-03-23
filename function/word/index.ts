import fs from 'fs';
import path from 'path';
var word = require('../../json/word');
import * as api from '../../lib/api';
import config from '../../config';

//苏苏的随机数生成姬
const random = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n); };


//更新json文件
function xie(file:any){
	let jsonstr:string = JSON.stringify(file,null,3);//转换为字符串
	let err: any;
	fs.writeFile(path.join(__dirname, "../../json/word.json"), jsonstr, function(err) {
	if (err) {
		console.error(err);
	}else{
		console.log("操作成功");
	}
});
}

//过滤一些关键词
function lue(txt:string){
	txt = txt.replace(/[\ |\[|\]]/g, "");
	return txt;	
}

//判断error
function isError(element:any, index:any, array:any) { 
    return (element==null); 
}  



//添加问答...
	api.command(/^.问(.*)答(.*)$/,async (m, e, reply) => {
	let wd1:string = m[1];//问后面的内容
	let wd2:string = m[2];//答后面的内容
	wd1=lue(wd1);
	if(word[wd1]==null){
		word[wd1]=[];
	}
	var i=word[wd1].push(wd2);//新增对象（属性
	
	xie(word);
	reply("添加成功,当前序列为"+i, config.app.color);
});

//删除部分问答
	api.command(/^.删问(.*)序[号|列](.*)$/,async (m, e, reply) => {
	let wd1:string = m[1];//问后面的内容
	let wd2 = Number(m[2])-1;
	wd1=lue(wd1);
	word[wd1].splice(wd2,1);
	var passed = word[wd1].every(isError); 
	if(passed==true){
	delete word[wd1];
	}
	
	
	xie(word);
	reply("删除成功", config.app.color);
});

//查看词库list
	api.command(/^.问表(.*)$/,async (m, e, reply) => {
	let wd1:string= m[1];
	let ran:number=0;
	for (let list of word[wd1]) {
	ran++;
    reply(ran+":"+list, config.app.color);
	}

	});

//删除一整个回复
	api.command(/^.删全问(.*)$/,async (m, e, reply) => {
	let wd1:string = m[1];//问后面的内容
	wd1=lue(wd1);

	delete word[wd1];
	
	xie(word);
	reply("删除成功", config.app.color);
});


//关键词回复
api.command(/^(.*)$/,async (m, e, reply) => {
let wd1:string = m[1];//发送的信息内容
	wd1=lue(wd1);
	if (word[wd1]!=null) {
		let ran:number=word[wd1].length;
		let rd:number=random(0, ran - 1);
		reply(word[wd1][rd], config.app.color);
	}

});
