import fs from 'fs/promises';

export interface ITransport<T> {
  pullContent(path: string): Promise<T>;
  pushContent(data: T, path: string): Promise<void>;
}

export class TextFileTransport implements ITransport<string> {
  async pullContent(path: string) {
    const fileContent = await fs.readFile(path, 'utf-8');
    return fileContent;
  }

  async pushContent(data: string, path: string) {
    await fs.writeFile(path, data);
  }
}

export class NetworkTransport implements ITransport<string> {
  async pullContent(path: string) {
    const response = await fetch(path);
    return response.text();
  }

  async pushContent(data: string, path: string) {
    const response = await fetch(path, {
      method: 'POST',
      body: data,
    });

    if (!response.ok) {
      throw new Error(`Failed to push content to ${path}: ${response.statusText}`);
    }
  }
}

export interface ISerializer<I, O> {
  serialize(input: I): Promise<O>;
  deserialize(input: O): Promise<I>;
}

export class JsonSerializer implements ISerializer<string, any> {
  async serialize(input: string) {
    return JSON.stringify(input);
  }

  async deserialize(input: any) {
    return JSON.parse(input);
  }
}

export interface IParser<I, O> {
  parse(input: I): Promise<O>;
  unparse(input: O): Promise<I>; // TODO
}

export class XcStringsParser implements IParser<string, any> {
  async parse(input: string) {
    // TODO
    return JSON.parse(input);
  }

  async unparse(input: any) {
    // TODO
    return JSON.stringify(input);
  }
}

export type ProcessFn<D> = (data: D, locale: string) => Promise<D>;

export abstract class BaseLoader<C = string, D = string> {
  public constructor(
    protected readonly defaultLocale: string,
    protected readonly transport: ITransport<C>,
    protected readonly parser: IParser<any, D>,
    protected readonly processFn: ProcessFn<D>,
  ) {}

  protected abstract deserializeData(content: C): Promise<D>;

  protected abstract serializeData(data: D): Promise<C>;

  public async process(locale: string) {
    const defaultContent = await this.transport.pullContent(this.defaultLocale);
    const defaultRawData = await this.deserializeData(defaultContent);

    const defaultParsedData = await this.parser.parse(defaultRawData);
    const processedData = await this.processFn(defaultParsedData, locale);
    const finalData = await this.parser.unparse(processedData);

    const finalContent = await this.serializeData(finalData);
    await this.transport.pushContent(finalContent, locale);
  }
}

export 
