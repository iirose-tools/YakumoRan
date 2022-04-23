import axios from 'axios'
import * as Ran from '../../lib/api'
import logger from '../../lib/logger'
import vm from 'vm'

interface EventData {
  event: string;
  data: any
}

const Store = {
  // TODO: 完成数据存储API
}

const buildContext = (EventData: EventData) => {
  const API = { ...Ran.method }

  // @ts-ignore
  delete API.payment
  // @ts-ignore
  delete API.sendDamaku
  // @ts-ignore
  delete API.admin

  const context = {
    logger: logger(`ScriptVM ${Math.round(Math.random() * 1e8)}`),
    Store: Store,
    Bot: {
      API: API
    }
  }

  return context
}

// eslint-disable-next-line no-unused-vars
class Script {
  url: string
  code: string

  constructor (url: string) {
    this.url = url
    this.code = ''

    this.load()
  }

  async load () {
    const response = await axios.get(this.url)
    this.code = response.data
  }

  async parser () {
    this.code.split('\n').forEach(line => {
      if (line.startsWith('//')) {
        const data = line.split(' ')

        const type: string = data[1]
        const name: any = data[2]

        if (type === '@event') {
          Ran.Event.on(name, (data: any) => {
            this.emit(name, data)
          })
        }
      }
    })
  }

  async emit (name: string, data: any) {
    const context = buildContext({
      event: name,
      data: data
    })

    this.run(context)
  }

  async run (context: any) {
    const script = new vm.Script(this.code)

    const msg = []

    context.echo = (str: string) => msg.push(str)

    script.runInContext(context, {
      timeout: 5e3
    })
  }
}

// TODO: 脚本管理器
