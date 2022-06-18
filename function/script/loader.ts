import axios from 'axios'
import * as Ran from '../../lib/api'
import logger from '../../lib/logger'
import vm from 'vm'
import path from 'path'
import fs from 'fs'

interface EventData {
  event: string;
  data: any
}

const Store: any = {
  _filename: path.join(Ran.Data, 'script', 'store.json'),
  _data: {},
  _write: () => fs.writeFileSync(Store._filename, JSON.stringify(Store._data)),
  _read: () => (Store._data = JSON.parse(fs.existsSync(Store._filename) ? fs.readFileSync(Store._filename).toString() : '{}')),

  get: (namespace: string, key: string) => {
    return Store._data[`${namespace}:${key}`]
  },
  set: (namespace: string, key: string, data: any) => {
    try {
      Store._data[`${namespace}:${key}`] = data
      Store._write()
      return true
    } catch (error) {
      return false
    }
  },
  remove: (namespace: string, key: string) => {
    try {
      delete Store._data[`${namespace}:${key}`]
      Store._write()
      return true
    } catch (error) {
      return false
    }
  },
  list: (namespace: string, query?: string) => {
    const result: any = {}

    for (const key of Object.keys(Store._data)) {
      if (key.startsWith(`${namespace}:`)) {
        if (!query) {
          result[key.split(':')[1]] = Store._data[key]
        } else {
          if (key.split(':')[1].includes(query)) result[key.split(':')[1]] = Store._data[key]
        }
      }
    }
  }
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
