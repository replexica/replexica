import fs from "fs";
import JSON5 from "json5";
import { composeLoaders } from "../_utils";
import { datoConfigSchema } from "./_base";
import createDatoFilterLoader from "./filter";
import createDatoApiLoader from "./api";
import createDatoExtractLoader from "./extract";

export default function createDatoLoader(configFilePath: string) {
  try {
    const configContent = fs.readFileSync(configFilePath, "utf-8");
    const datoConfig = datoConfigSchema.parse(JSON5.parse(configContent));

    return composeLoaders(
      createDatoApiLoader(datoConfig, (updatedConfig) =>
        fs.writeFileSync(configFilePath, JSON5.stringify(updatedConfig, null, 2)),
      ),
      createDatoFilterLoader(),
      createDatoExtractLoader(),
    );
  } catch (error: any) {
    throw new Error([`Failed to parse DatoCMS config file.`, `Error: ${error.message}`].join("\n\n"));
  }
}
