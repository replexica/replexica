export type PoTranslationEntry = {
  id: string;
  value: string;
  pluralValue?: string;
  context?: string;
  metadata?: Record<string, string>;
  flags?: string[];
};
