import { Plugin } from '.'
import { IEmissions } from '../bot/index'

interface ExtendsPlugin extends Plugin {
  [key: string]: any
}

interface CommandOptions {
  name: string;
  desc: string;
  usage: string;
  command: string;
}

interface Command {
  options: CommandOptions;
  handle: Function
}

interface Middleware {
  event: keyof IEmissions;
  handle: Function
  inBottom: boolean
}

interface EventListener {
  event: keyof IEmissions;
  handle: Function
}

export class Decorators {
  commands = new Map<string, Command>();
  middlewares = new Map<string, Middleware[]>();
  events = new Map<string, EventListener[]>();

  Command(command: CommandOptions) {
    return (target: ExtendsPlugin, propertyKey: keyof ExtendsPlugin, descriptor: PropertyDescriptor) => {
      this.commands.set(command.name, {
        options: command,
        handle: descriptor.value,
      })
    }
  }

  Middleware(event: keyof IEmissions, inBottom: boolean = false) {
    return (target: ExtendsPlugin, propertyKey: keyof ExtendsPlugin, descriptor: PropertyDescriptor) => {
      if (!this.middlewares.has(event)) this.middlewares.set(event, [])
      const list = this.middlewares.get(event) as Middleware[];

      list.push({
        event: event,
        handle: descriptor.value,
        inBottom: inBottom
      })

      this.middlewares.set(event, list);
    };
  }

  EventListener(event: keyof IEmissions) {
    return (target: ExtendsPlugin, propertyKey: keyof ExtendsPlugin, descriptor: PropertyDescriptor) => {
      if (!this.events.has(event)) this.events.set(event, [])
      const list = this.events.get(event) as EventListener[];

      list.push({
        event: event,
        handle: descriptor.value,
      })

      this.events.set(event, list);
    }
  }
}