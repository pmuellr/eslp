// only used for type checking in vscode

export type IsValType = <V>(o: ValOrErr<V>) => o is Val<V>
export type IsErrType = <V>(o: ValOrErr<V>) => o is Err

interface ValAndErr { 
  readonly isVal: boolean 
  readonly isErr: boolean 
}

export interface Val<V> extends ValAndErr { readonly val: V }
export interface Err    extends ValAndErr { readonly err: Error }

export type ValOrErr<V> = Val<V> | Err