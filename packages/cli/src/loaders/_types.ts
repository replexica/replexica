export interface ILoaderDefinition<I, O> {
  pull(locale: string, rawData: I): Promise<O>;
  push(locale: string, data: O, rawData?: I | null): Promise<I>;

  onStart?(): Promise<void>;
  onProgress?(current: number, total: number): Promise<void>;
  onEnd?(): Promise<void>;
}

export interface ILoader<I, O> extends ILoaderDefinition<I, O> {
  setDefaultLocale(locale: string): this;

  pull(locale: string, rawData: I): Promise<O>;
  push(locale: string, data: O): Promise<I>;

  onStart(): Promise<void>;
  onProgress(current: number, total: number): Promise<void>;
  onEnd(): Promise<void>;
}
