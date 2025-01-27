declare module "node-webvtt" {
  export function parse(data: string): any;
  export function compile(data: any): string;
}
