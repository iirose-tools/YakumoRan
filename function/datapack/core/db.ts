import * as Ran from '../../../lib/api'
import fs from 'fs'
import path from 'path'

export default class Database {
  private path: string
  private db: {
    [index: string]: any
  }

  constructor (id: string) {
    this.db = {}
    this.path = path.join(Ran.Data, 'datapack', `${id}.json`)
    this.read()
  }

  private read () {
    if (!fs.existsSync(this.path)) return
    this.db = JSON.parse(fs.readFileSync(this.path).toString())
  }

  private write () {
    fs.writeFileSync(this.path, JSON.stringify(this.db))
  }

  set (key: string, value: any) {
    this.db[key] = value
    this.write()
  }

  get (key: string) {
    return this.db[key]
  }

  del (key: string) {
    delete this.db[key]
    this.write()
  }
}
