// only types, used for validation in vscode

interface Val<V> { val: V;     err: undefined }
interface Err    { err: Error; val: undefined }
export type ValOrErr<V> = Val<V> | Err

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