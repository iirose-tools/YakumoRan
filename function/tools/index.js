"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api = __importStar(require("../../lib/api"));
const config_1 = __importDefault(require("../../config"));
const permission_1 = __importDefault(require("../permission/permission"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// 创建存储文件夹
try {
    fs_1.default.mkdirSync(path_1.default.join(api.Data, './tools'));
}
catch (error) { }
// 正文↓
api.command(/^赞我$/, 'tools.like', (m, e, reply) => {
    api.method.like(e.uid, 'qwq');
});
api.command(/^带去(.*)$/, 'toole.goto', (m, e, reply) => {
    if (e.username === config_1.default.account.username)
        return; // 不响应自己发送的消息
    try {
        if (!permission_1.default.users.hasPermission(e.uid, 'tool.mov') && !permission_1.default.users.hasPermission(e.uid, 'permission.tool.mov'))
            return;
        let a = '';
        if (m[1].match(/ \[_(.*)_\] /)) {
            a = m[1].match(/ \[_(.*)_\] /);
        }
        else {
            a = ['', ''];
        }
        api.method.bot.moveTo(a[1]);
    }
    catch (error) { }
});
api.command(/^订阅$/, 'tools.feed.open', (m, e, reply) => {
    try {
        if (!permission_1.default.users.hasPermission(e.uid, 'tool.op') && !permission_1.default.users.hasPermission(e.uid, 'permission.tool.op'))
            return reply(` [Tools] :  [*${e.username}*] 您没有足够的权限去订阅`);
        permission_1.default.users.addPermission(e.uid, 'tool.chat');
        reply(` [Tools] :  [*${e.username}*] 订阅成功了哦~`);
    }
    catch (error) {
        if (permission_1.default.users.hasPermission(e.uid, 'tool.chat'))
            return reply(` [Tools] :  [*${e.username}*] 您已成功订阅，无需再次订阅`);
    }
});
api.command(/^取消订阅$/, 'tools.feed.calcel', (m, e, reply) => {
    try {
        if (!permission_1.default.users.hasPermission(e.uid, 'tool.chat') && !permission_1.default.users.hasPermission(e.uid, 'permission.tool.chat'))
            return reply(` [Tools] :  [*${e.username}*] 您没有订阅`);
        permission_1.default.users.removePermission(e.uid, 'tool.chat');
        reply(` [Tools] :  [*${e.username}*] 取消订阅成功了哦~`);
    }
    catch (error) {
        if (!permission_1.default.users.hasPermission(e.uid, 'tool.chat'))
            return reply(` [Tools] :  [*${e.username}*] 您未选择订阅...`);
    }
});
api.Event.on('PublicMessage', msg => {
    try {
        if (msg.username === config_1.default.account.username)
            return; // 不响应自己发送的消息
        const list = permission_1.default.users.has('tool.chat');
        list.forEach(function (e) {
            const a = e.toLowerCase();
            api.method.sendPrivateMessage(a, ` [*${msg.username}*]  :  ${msg.message.trim()}`);
        });
    }
    catch (error) {
    }
});
api.Event.on('PrivateMessage', msg => {
    try {
        if (msg.username === config_1.default.account.username)
            return; // 不响应自己发送的消息
        const list = permission_1.default.users.has('tool.chat');
        list.forEach(function (e) {
            const a = e.toLowerCase();
            if (a === msg.uid) {
                api.method.sendPublicMessage(` [*${msg.username}*]  :  ${msg.message.trim()}`);
            }
        });
    }
    catch (error) {
    }
});
