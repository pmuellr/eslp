// only used for type checking in vscode

export type ValOrErr<V> = Val<V> | Err

export interface Val<V> extends ValAndErr { readonly val: V }
export interface Err    extends ValAndErr { readonly err: Error }

interface ValAndErr { 
  readonly isVal: boolean 
  readonly isErr: boolean 
}
