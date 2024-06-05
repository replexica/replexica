export type I18nNodeRole = 'context' | 'scope' | 'fragment';

export type I18nNode = {
  role: I18nNodeRole;
  value: string;
  nodes: I18nNode[];
};
