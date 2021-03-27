import fs from 'fs';
import path from 'path';
import * as api from '../../lib/api';
import config from '../../config';
import logger from '../../lib/logger';

const getWord = () => {
	const wordPath = path.join(__dirname, "../../data/word/word.json")
	if(!fs.existsSync(wordPath)) {
		fs.writeFileSync(wordPath, "{}");
		return {}
	}

	return JSON.parse(fs.readFileSync(wordPath).toString());
}

//苏苏的随机数生成姬
const random = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n); };

//更新json文件
const update = (file: any) => {
	try {
		fs.writeFileSync(path.join(__dirname, path.join(__dirname, "../../data/word/word.json")), JSON.stringify(file));
		logger("Word").info("词库文件写入成功");
	} catch (error) {
		logger("Word").warn("词库文件写入失败", error);
	}
}

//过滤一些关键词
const fitter = (txt: string) => {
	txt = txt.replace(/[\ |\[|\]]/g, "");
	return txt;
}

//判断error
const isError = (element: any, index: any, array: any) => {
	return (element == null);
}

//添加问答...
api.command(/^\.问(.*)答(.*)$/, async (m, e, reply) => {
	const word = getWord();
	let wd1: string = m[1];//问后面的内容
	let wd2: string = m[2];//答后面的内容
	wd1 = fitter(wd1);
	if (word[wd1] == null) {
		word[wd1] = [];
	}
	const i = word[wd1].push(wd2);//新增对象（属性

	update(word);
	reply("添加成功,当前序列为" + i, config.app.color);
});

//删除部分问答
api.command(/^\.删问(.*)序[号|列](.*)$/, async (m, e, reply) => {
	const word = getWord();
	let wd1: string = m[1];//问后面的内容
	let wd2 = Number(m[2]) - 1;
	wd1 = fitter(wd1);
	word[wd1].splice(wd2, 1);
	const passed = word[wd1].every(isError);
	if (passed == true) {
		delete word[wd1];
	}

	update(word);
	reply("删除成功", config.app.color);
});

//查看词库list
api.command(/^\.问表(.*)$/, async (m, e, reply) => {
	const word = getWord();
	let wd1: string = m[1];
	let ran: number = 0;
	for (let list of word[wd1]) {
		ran++;
		reply(ran + ":" + list, config.app.color);
	}
});

//删除一整个回复
api.command(/^\.删全问(.*)$/, async (m, e, reply) => {
	let wd1: string = m[1];//问后面的内容
	const word = getWord();
	wd1 = fitter(wd1);

	delete word[wd1];

	update(word);
	reply("删除成功", config.app.color);
});

//关键词回复
api.command(/^(.*)$/, async (m, e, reply) => {
	const word = getWord();
	let wd1: string = m[1];//发送的信息内容
	wd1 = fitter(wd1);
	if (word[wd1] != null) {
		let ran: number = word[wd1].length;
		let rd: number = random(0, ran - 1);
		reply(word[wd1][rd], config.app.color);
	}
});