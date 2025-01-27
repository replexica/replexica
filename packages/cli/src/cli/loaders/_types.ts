export interface ILoaderDefinition<I, O, C> {
  init?(): Promise<C>;
  pull(locale: string, input: I, initCtx?: C): Promise<O>;
  push(locale: string, data: O, originalInput: I | null, originalLocale: string): Promise<I>;
}

export interface ILoader<I, O, C = void> extends ILoaderDefinition<I, O, C> {
  setDefaultLocale(locale: string): this;
  init(): Promise<C>;
  pull(locale: string, input: I): Promise<O>;
  push(locale: string, data: O): Promise<I>;
}
