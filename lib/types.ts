// only types, used for validation in vscode

export type { Val, Err, ValOrErr } from './val-or-error'

export interface ServerBase {
  name:        string
  esRemoteURL: string
  kbRemoteURL: string
  esLocalHost: string
  kbLocalHost: string
  esLocalURL?: string
  kbLocalURL?: string
}

export interface ServerUserPass extends ServerBase {
  user:    string
  pass:    string
}

export interface ServerApiKey extends ServerBase {
  apiKey:  string
}

export type Server = ServerUserPass | ServerApiKey

export type IsServerUserPassType = <V>(o: Server) => o is ServerUserPass
export type IsServerApiKeyType   = <V>(o: Server) => o is ServerApiKey

export interface Cli {
  port?:      number
  configFile: string
  help:       boolean
  version:    boolean
  debug:      boolean
  output:     string
}

export interface Cors {
  origins?: string[]
  methods?: string[]
}

export interface Config {
  debug?:   boolean
  port?:    number
  cert?:    string
  key?:     string
  servers:  Server[]
  fileName: string
  cors?:    Cors
}