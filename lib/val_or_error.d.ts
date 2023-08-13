// only used for type checking in vscode

interface Val<V> { val: V;     err: undefined; getVal: () => V; }
interface Err    { err: Error; val: undefined; getErr: () => Error; }
export type ValOrErr<V> = Val<V> | Err

export type IsValType = <V>(o: ValOrErr<V>) => o is Val<V>;
export type IsErrType = <V>(o: ValOrErr<V>) => o is Err;