export interface ILoaderDefinition<I, O> {
  pull(rawData: I, locale: string): Promise<O>;
  push(data: O, locale: string, rawData: I): Promise<I>;

  onStart?(): Promise<void>;
  onProgress?(current: number, total: number): Promise<void>;
  onEnd?(): Promise<void>;
}

export interface ILoader<I, O> extends ILoaderDefinition<I, O> {
  setLocale(locale: string): this;

  pull(rawData: I): Promise<O>;
  push(data: O): Promise<I>;

  onStart(): Promise<void>;
  onProgress(current: number, total: number): Promise<void>;
  onEnd(): Promise<void>;
}
