import _ from "lodash";
import fs from "fs";
import { ILoader } from "../_types";
import { createLoader } from "../_utils";
import { DatoApiLoaderOutput } from "./api";

export type DatoFilterLoaderOutput = {
  [modelId: string]: {
    [recordId: string]: {
      [fieldName: string]: any;
    };
  };
};

export default function createDatoFilterLoader(): ILoader<DatoApiLoaderOutput, DatoFilterLoaderOutput> {
  return createLoader({
    async pull(locale, input) {
      const result: DatoFilterLoaderOutput = {};

      for (const [modelId, modelInfo] of _.entries(input)) {
        result[modelId] = {};
        for (const record of modelInfo.records) {
          result[modelId][record.id] = _.chain(modelInfo.fields)
            .mapKeys((field) => field.api_key)
            .mapValues((field) => _.get(record, [field.api_key, locale]))
            .value();
        }
      }

      return result;
    },
    async push(locale, data, originalInput, originalLocale) {
      const result = _.cloneDeep(originalInput || {});

      for (const [modelId, modelInfo] of _.entries(result)) {
        for (const record of modelInfo.records) {
          for (const [fieldId, fieldValue] of _.entries(record)) {
            const fieldInfo = modelInfo.fields.find((field) => field.api_key === fieldId);
            if (fieldInfo) {
              const sourceFieldValue = _.get(fieldValue, [originalLocale]);
              const targetFieldValue = _.get(data, [modelId, record.id, fieldId]);
              if (targetFieldValue) {
                _.set(record, [fieldId, locale], targetFieldValue);
              } else {
                _.set(record, [fieldId, locale], sourceFieldValue);
              }

              _.chain(fieldValue)
                .keys()
                .reject((loc) => loc === locale || loc === originalLocale)
                .filter((loc) => _.isEmpty(_.get(fieldValue, [loc])))
                .forEach((loc) => _.set(record, [fieldId, loc], sourceFieldValue))
                .value();
            }
          }
        }
      }

      return result;
    },
  });
}
