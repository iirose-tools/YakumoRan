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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var api = __importStar(require("../../lib/api"));
var config_1 = __importDefault(require("../../config"));
var logger_1 = __importDefault(require("../../lib/logger"));
var random_number_csprng_1 = __importDefault(require("random-number-csprng"));
// import { report } from 'process'
try {
    fs_1.default.mkdirSync(path_1.default.join(__dirname, '../../data/probability'));
}
catch (error) { }
var limit = {};
var limit2 = {};
var getLimit = function (uid, tim) {
    if (limit[uid])
        return false;
    limit[uid] = true;
    setTimeout(function () {
        delete limit[uid];
    }, tim);
    return true;
};
var secondLimit = function (uid, tim) {
    if (limit2[uid])
        return false;
    limit2[uid] = true;
    setTimeout(function () {
        delete limit2[uid];
    }, tim);
    return true;
};
// 获取玩家的金币
var getMoney = function (uid) {
    var moneyPath = path_1.default.join(__dirname, "../../data/probability/" + uid + ".json");
    if (!fs_1.default.existsSync(moneyPath)) {
        fs_1.default.writeFileSync(moneyPath, '{"money":100,"probab":50}');
    }
    return JSON.parse(fs_1.default.readFileSync(moneyPath).toString());
};
// 更新json文件
var update = function (uid, file) {
    try {
        fs_1.default.writeFileSync(path_1.default.join(__dirname, "../../data/probability/" + uid + ".json"), JSON.stringify(file, null, 3));
        logger_1.default('probability').info('文件写入成功');
    }
    catch (error) {
        logger_1.default('probability').warn('文件写入失败', error);
    }
};
// 核心源码
// eslint-disable-next-line no-useless-escape
api.command(new RegExp("^" + config_1.default.app.nickname + "\u538B(.*)$"), function (m, e, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var nowMoney, m1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!getLimit(e.uid, config_1.default.function.probab.every))
                    return [2 /*return*/];
                nowMoney = getMoney(e.uid);
                if (nowMoney.probab <= 0 || nowMoney.probab >= 100) {
                    nowMoney.probab = 50;
                }
                m1 = m[1] === '完' ? nowMoney.money : Number(m[1].trim());
                if (isNaN(m1))
                    return [2 /*return*/, reply('你输入的似乎不是数字哦~换成数字再试一下吧', config_1.default.app.color)];
                if (m1 <= 0)
                    return [2 /*return*/, reply('下注金额必须大于0', config_1.default.app.color)];
                if (m1 > nowMoney.money)
                    return [2 /*return*/, reply('下注金额必须小于您当前余额哦~', config_1.default.app.color)];
                if (m1 <= Math.max() || m1 >= Math.min())
                    return [2 /*return*/, reply('请输入一个正常的数字', config_1.default.app.color)];
                if (!(nowMoney.money >= m1)) return [3 /*break*/, 2];
                return [4 /*yield*/, random_number_csprng_1.default(0, 100)];
            case 1:
                if ((_a.sent()) >= nowMoney.probab) {
                    nowMoney.money = nowMoney.money - m1;
                    if (nowMoney.money <= 0) {
                        if (secondLimit(e.uid, config_1.default.function.probab.huifu)) {
                            nowMoney.probab = nowMoney.probab + 10;
                            nowMoney.money = 100;
                            update(e.uid, nowMoney);
                            reply(" [*" + e.username + "*]   :  \u4F59\u989D - " + m1 + " \u949E   \u274C   ,   \u5DF2\u7ECF\u628A\u60A8\u7684\u4F59\u989D\u6062\u590D\u4E3A\u4E86 100 \u949E , \u4E0B\u6B21\u6062\u590D\u8FD8\u6709" + String(config_1.default.function.probab.huifu / 1000) + "\u79D2\uFF01\u795D\u60A8\u6E38\u73A9\u6109\u5FEB~ ", config_1.default.app.color);
                        }
                        else {
                            nowMoney.probab = nowMoney.probab + 10;
                            update(e.uid, nowMoney);
                            reply(" [*" + e.username + "*]   :  \u4F59\u989D - " + m1 + " \u949E   \u274C   ,   \uD83D\uDCB0 " + String(nowMoney.money) + " \u949E   ,   \u6062\u590D\u8FD8\u5728CD\u54E6~\u8BF7\u4F11\u606F\u4E00\u4E0B\uFF0C\u7B49\u4F1A\u8FC7\u4E00\u4F1A\u53D1\u9001\u201C\u91CD\u542F\u94B1\u5305\u201D\u6765\u91CD\u7F6E\u94B1\u5305\u5427\uFF01", config_1.default.app.color);
                        }
                    }
                    else {
                        nowMoney.probab = nowMoney.probab + 10;
                        update(e.uid, nowMoney);
                        reply(" [*" + e.username + "*]   :  \u4F59\u989D - " + m1 + " \u949E   \u274C   ,   \uD83D\uDCB0 " + String(nowMoney.money) + " \u949E", config_1.default.app.color);
                    }
                }
                else {
                    nowMoney.probab = nowMoney.probab - 10;
                    nowMoney.money = nowMoney.money + m1;
                    update(e.uid, nowMoney);
                    reply(" [*" + e.username + "*]   :  \u4F59\u989D + " + m1 + " \u949E   \u2714\uFE0F   ,   \uD83D\uDCB0 " + String(nowMoney.money) + " \u949E", config_1.default.app.color);
                }
                return [3 /*break*/, 3];
            case 2:
                reply(" [*" + e.username + "*]   :  \u62B1\u6B49  ,  \u60A8\u7684\u4F59\u989D\u4E0D\u8DB3  ,  \u60A8\u7684\u5F53\u524D\u4F59\u989D\u4E3A  :  " + String(nowMoney.money) + " \u949E", config_1.default.app.color);
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); });
// 查看钱包
api.command(/^查看钱包$/, function (m, e, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var nowMoney;
        return __generator(this, function (_a) {
            nowMoney = getMoney(e.uid);
            reply(" [*" + e.username + "*]   :  \u60A8\u7684\u4F59\u989D\u4E3A  :  " + String(nowMoney.money) + "\u949E", config_1.default.app.color);
            return [2 /*return*/];
        });
    });
});
// 钱包重启计划
api.command(/^重启钱包$/, function (m, e, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var nowMoney;
        return __generator(this, function (_a) {
            nowMoney = getMoney(e.uid);
            if (!secondLimit(e.uid, config_1.default.function.probab.huifu)) {
                return [2 /*return*/, null];
            }
            else {
                nowMoney.money = 100;
                nowMoney.probab = 50;
                update(e.uid, nowMoney);
                reply(" [*" + e.username + "*]   :  \u5514~! \u8BF7\u52A0\u6CB9\u54E6~ \u8FD9\u662F\u9601\u4E0B\u7684\u65B0\u94B1\u5305~ \u795D\u60A8\u80FD\u591F\u73A9\u5F97\u6109\u5FEB~!  :  " + String(nowMoney.money) + "\u949E", config_1.default.app.color);
            }
            return [2 /*return*/];
        });
    });
});
// 设置积分
api.command(/^设置(.*):(.*)$/, function (m, e, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var m1, nowMoney, theUid;
        return __generator(this, function (_a) {
            m1 = Number(m[2].trim());
            if (m1 <= Math.max() || m1 >= Math.min())
                return [2 /*return*/, reply('请输入一个正常的数字', config_1.default.app.color)];
            nowMoney = getMoney(e.uid);
            if (e.username !== config_1.default.app.master) {
                reply(" [*" + e.username + "*]   :  " + config_1.default.app.nickname + "\u505A\u4E0D\u5230\u5566...\u53BB\u53EB\u53EB\u54B1\u7684\u4E3B\u4EBA\u6765\u8BD5\u8BD5..(?", config_1.default.app.color);
                return [2 /*return*/, null];
            }
            theUid = m[1].replace(/[@[\] ]/g, '').trim();
            nowMoney.money = m1;
            update(theUid, m1);
            reply(" [*" + e.username + "*]   :  \u60A8\u7684\u4F59\u989D\u4E3A  :  " + String(nowMoney.money) + "\u949E", config_1.default.app.color);
            return [2 /*return*/];
        });
    });
});
