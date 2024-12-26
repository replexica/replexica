import Z from 'zod';

// DatoCMS config
export const datoConfigSchema = Z.object({
  projectId: Z.string(),
  localizables: Z.record(
    Z.string(),
    Z.object({ fields: Z.array(Z.string()) }),
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
