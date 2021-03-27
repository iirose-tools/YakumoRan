import fs from 'fs';

const configPath = "./config.json";
if (!fs.existsSync(configPath)) {
  const defaultConfig = {
    app: {
      nickname: "机器人昵称",
      master: "主人用户名",
      master_uid: '主人uid',
      color: "消息颜色"
    },
    chat: {
      disable: true
    },
    account: {
      username: "机器人用户名",
      password: "机器人密码md5",
      room: "房间id"
    },
    logger: {
      level: "INFO"
    }
  }

  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, undefined, 4));
  console.log("默认配置创建完成，请修改 config.json 后重新启动程序")
  process.exit(0);
}

export default JSON.parse(fs.readFileSync("./config.json").toString())