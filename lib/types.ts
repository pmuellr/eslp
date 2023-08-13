// only types, used for validation in vscode

export type { Val, Err, ValOrErr } from './val_or_error'

export interface Server {
  name: string
  url:  string
  user: string
  pass: string
}

export interface Config {
  debug:   boolean
  port:    number
  servers: Server[]
}