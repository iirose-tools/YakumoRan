import express from 'express'
import { Logger } from '../logger'

export class WebServer {
  private app: express.Application
  private port: number
  private logger: Logger = new Logger('WebServer')

  constructor (port: number) {
    this.app = express()
    this.port = port

    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(express.static(`${__dirname}/public`))

    this.start()
  }

  public start () {
    this.app.listen(this.port, () => {
      this.logger.info(`WebServer 启动成功，监听端口 ${this.port}`)
    })
  }

  public routeList () {
    return this.app._router.stack
      .filter((r: any) => r.route)
      .map((r: any) => {
        return {
          path: Object.keys(r.route.methods)[0].toUpperCase() + ' ' + r.route.path
        }
      })
  }

  public route (path: string, router: express.Router) {
    this.app.use(path, router)
  }
}