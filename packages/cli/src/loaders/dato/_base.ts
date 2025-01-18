import Z from "zod";

// DatoCMS config
export const datoConfigSchema = Z.object({
  project: Z.string(),
  model: Z.string(),
  records: Z.array(Z.string()).optional().default([]),
  fields: Z.array(Z.string()),
});

export type DatoConfig = Z.infer<typeof datoConfigSchema>;

// DatoCMS settings
export const datoSettingsSchema = Z.object({
  auth: Z.object({
    apiKey: Z.string(),
  }),
});

export type DatoSettings = Z.infer<typeof datoSettingsSchema>;

export type DastNode = {
  type: string;
  value?: string;
  marks?: Array<{ type: string }>;
  children?: DastNode[];
  [key: string]: any;
};

export type DastContent = {
  schema: "dast";
  document?: {
    type: "root";
    children: DastNode[];
  };
};

export type DatoRecord = {
  id: string;
  type: string;
  [field: string]: any | DastContent;
};

export type DatoField<K, V> = {
  type: K;
  key: string;
  value: { [locale: string]: V };
  localizationEnabled: boolean;
};

export type DatoFieldString = DatoField<"string", string>;
export type DatoFieldDast = DatoField<"dast", DastContent>;
export type DatoFieldAny = DatoFieldString | DatoFieldDast;

export const DEFAULT_LOCALE = "en";
