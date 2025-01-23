export type GetTextTranslation = {
  msgid: string;
  msgid_plural?: string;
  msgstr: string[];
  msgctxt?: string;
};

export type PluralTranslation = {
  singularValue: string;
  pluralValue: string;
};

export type ContextTranslation = {
  context: string;
  value: string;
};

export type TranslationValue = string | PluralTranslation | ContextTranslation;
