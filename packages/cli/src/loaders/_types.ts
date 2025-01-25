export interface ILoaderDefinition<I, O> {
  pull(locale: string, input: I, originalInput?: I | null): Promise<O>;
  push(locale: string, data: O, originalInput?: I | null): Promise<I>;

  // onStart?(): Promise<void>;
  // onProgress?(current: number, total: number): Promise<void>;
  // onEnd?(): Promise<void>;
}

export interface ILoader<I, O> extends ILoaderDefinition<I, O> {
  setDefaultLocale(locale: string): this;

  pull(locale: string, input: I): Promise<O>;
  push(locale: string, data: O): Promise<I>;

  // onStart(): Promise<void>;
  // onProgress(current: number, total: number): Promise<void>;
  // onEnd(): Promise<void>;
}
