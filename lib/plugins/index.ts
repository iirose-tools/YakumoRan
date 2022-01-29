import fs from 'fs'
import path from 'path'
import logger from '../logger'
import Context from './ctx'

const functionPath = path.join(__dirname, '../../function')

const func: any = {}
const ctx = new Context()

fs.readdirSync(functionPath).forEach(e => {
  logger('Plugin').info(`正在加载 ${e} ...`)

  const itemPath = path.join(functionPath, e)
  const packageData = JSON.parse(fs.readFileSync(path.join(itemPath, 'package.json')).toString())

  try {
    fs.mkdirSync(path.join(process.cwd(), `./data/${packageData.id}`))
  } catch (error) {}

  const plugin = require(path.join(itemPath, packageData.main))

  plugin(ctx)

  func[packageData.id] = {}
  func[packageData.id].helper = Object.values(packageData.commands)
  func[packageData.id].author = packageData.author
  func[packageData.id].intro = packageData.intro
  func[packageData.id].name = packageData.name

  logger('Plugin').info(`${e} 加载完成`)
})
