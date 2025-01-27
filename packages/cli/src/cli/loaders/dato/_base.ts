import Z from "zod";

// DatoCMS config
export const datoConfigSchema = Z.object({
  project: Z.string(),
  models: Z.record(
    Z.string(),
    Z.object({
      records: Z.array(Z.string()).optional(),
      fields: Z.array(Z.string()).optional(),
    }),
  ),
});

export type DatoConfig = Z.infer<typeof datoConfigSchema>;

// DatoCMS settings
export const datoSettingsSchema = Z.object({
  auth: Z.object({
    apiKey: Z.string(),
  }),
});

export type DatoSettings = Z.infer<typeof datoSettingsSchema>;

export const DEFAULT_LOCALE = "en";

//

export type DatoRecordPayload = {
  [field: string]: {
    [locale: string]: DatoValue;
  };
};

export type DatoValue = DatoSimpleValue | DatoComplexValue;
export type DatoSimpleValue = DatoPrimitive | DastDocument;
export type DatoComplexValue = DatoBlock | DatoBlock[];

export type DatoPrimitive = null | string | boolean | number;

export type DastDocument = {
  schema: "dast";
  document: DastDocumentNode;
};

export type DastDocumentNode = {
  type: "root" | "span" | "paragraph";
  value?: DatoPrimitive;
  children?: DastDocumentNode[];
};

export type DatoBlock = {
  id?: string;
  type: "item";
  attributes: Record<string, DatoSimpleValue>;
  relationships: any;
};
