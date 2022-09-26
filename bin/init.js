const yakumoran = require('@yakumoran/core')
const fs = require('fs')

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'))
const app = new yakumoran.App(config)

for (const name in config.plugins) {
  app.loadPlugin(name)
}
