export type ValOrErr<V> = { 
  val: V
  err: undefined
} | { 
  val: undefined
  err: Error
}

export interface Server {
  name: string
  url: string
  user: string
  pass: string
}

export interface Config {
  debug: boolean
  port: number
  servers: Server[]
}