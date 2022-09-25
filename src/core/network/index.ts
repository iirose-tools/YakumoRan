import pako from 'pako'
import { EventEmitter } from 'events'
import ws from 'ws'
import { Logger } from '../logger'

interface IEmissions {
  open: () => void
  close: () => void
  error: (error: ws.ErrorEvent) => void
  message: (data: string) => void
}

export class WebSocket extends EventEmitter {
  private _untypedOn = this.on
  private _untypedEmit = this.emit
  public on = <K extends keyof IEmissions>(event: K, listener: IEmissions[K]): this => this._untypedOn(event, listener)
  public emit = <K extends keyof IEmissions>(event: K, ...args: Parameters<IEmissions[K]>): boolean => this._untypedEmit(event, ...args)

  private socket: ws
  private isOpen: boolean = false
  private allowClose: boolean = false
  private logger: Logger
  private failCount: number = 0

  constructor() {
    super()
    this.logger = new Logger('WebSocket')

    this.logger.debug('正在初始化WebSocket...')

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    this.socket = new ws('wss://m2.iirose.com:8778')
    this.init()
    
    this.logger.debug('WebSocket初始化完成')
  }

  // 手动断开连接
  public close () {
    this.allowClose = true
    this.socket.close()
  }

  // 手动连接
  public connect () {
    this.socket = new ws('wss://m2.iirose.com:8778')
    this.init()
  }

  // 初始化
  private init () {
    this.allowClose = false
    this.socket.onopen = this.handleOpen.bind(this)
    this.socket.onclose = this.handleClose.bind(this)
    this.socket.onmessage = this.handleMessage.bind(this)
    this.socket.onerror = this.handleError.bind(this)
  }

  // 连接成功
  private handleOpen() {
    this.isOpen = true
    this.emit('open')
    this.logger.info('WebSocket连接成功')
    this.failCount = 0
  }

  // 连接关闭
  private handleClose() {
    this.isOpen = false
    this.emit('close')
    this.logger.warn('WebSocket连接已关闭')

    if (this.allowClose) return
    this.logger.warn('正在重连WebSocket...')
    this.socket = new ws('wss://m2.iirose.com:8778')
    this.init()
  }

  // 消息处理
  private handleMessage(event: ws.MessageEvent) {
    const array = new Uint8Array(event.data as ArrayBuffer)
    const isCompressed = array[0] === 1
    const data = isCompressed ? pako.inflate(array.slice(1), { to: 'string' }) : Buffer.from(array).toString()

    this.logger.debug(`Received(${data.length} bytes): ${data.length > 100 ? data.slice(0, 100) + '...' : data}`)

    this.emit('message', data)
  }

  // 错误处理
  private handleError(error: ws.ErrorEvent) {
    this.emit('error', error)
    this.close()

    this.failCount++

    if (this.failCount > 5) {
      this.logger.fatal('WebSocket多次连接失败，程序退出')
      process.exit(1)
    }

    this.connect()
  }

  /**
   * @description 发送消息
   * @param data 消息内容
   */
  public send (data: string): Promise<Error|undefined> {
    if (this.isOpen) {
      const deflatedData = pako.gzip(data)
      const deflatedArray = new Uint8Array(deflatedData.length + 1)
      deflatedArray[0] = 1
      deflatedArray.set(deflatedData, 1)
      
      return new Promise((resolve, reject) => {
        this.socket.send(deflatedArray, (err) => {
          if (err) return reject(err)
          resolve(undefined)
        })
      })
    }

    throw new Error('WebSocket is not open')
  }
}