import { WebServer } from ".";
import { Router } from "express";

interface InputConfig {
  type: 'text' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea' | 'custom'
  id: string
  name: string,
  custom?: string
  options?: {
    placeholder?: string
    value?: string
    class?: string[]
    id?: string
    seletions?: {
      text: string
      value: string
    }[]
  }
}

export class WebForm {
  private web: WebServer
  private router: Router = Router()
  private config: InputConfig[] = []
  private submit: (data: any) => string | undefined
  private id: string

  constructor (web: WebServer, id: string) {
    this.web = web
    this.id = id
    this.submit = (data: any) => '';

    this.router.get('/config', (req, res) => {
      res.json(this.config)
    })

    this.router.post('/submit', (req, res) => {
      const err = this.submit(req.body)
      if (err) return res.json({ err })
      res.json({ err: null })
    })

    this.web.route(`/form/${id}`, this.router)
  }

  /**
   * @description 添加文本显示
   * @param text 文本内容
   * @param styles css样式(不需要加分号)
   */
  public addText (text: string, styles?: string[]) {
    this.config.push({
      type: 'custom',
      id: '',
      name: '',
      custom: `<p style="${styles && styles.join(';')}">${text}</p>`
    })
  }

  /**
   * @description 添加自定义html(此方法会尝试读取id对应标签的value属性并返回给后端)
   */
  public addCustomCode (html: string, id: string) {
    this.config.push({
      type: 'custom',
      id: `${this.id}-${id}`,
      name: '',
      custom: html
    })
  }

  /**
   * @description 添加一个输入框
   * @param id 字段id
   * @param type 输入框的类型
   * @param name 输入提示
   * @param options 输入框的选项
   */
  public addInput (id: string, type: InputConfig['type'], name: string, options?: InputConfig['options']) {
    this.config.push({
      type,
      id,
      name,
      options: options || {}
    })
  }

  /**
   * @description 表单提交后的回调函数
   * @param callback 回调函数，返回值为错误信息，若返回值为 undefined 则表示没有错误
   */
  public onSubmitted (callback: (data: any) => string | undefined) {
    if (this.submit !== ((data: any) => '')) {
      throw new Error('onSubmitted can only be called once')
    }

    this.submit = callback
  }
}