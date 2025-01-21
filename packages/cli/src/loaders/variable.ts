import _ from "lodash";
import { ILoader } from "./_types";
import { composeLoaders, createLoader } from "./_utils";

export default function createVariableLoader(): ILoader<Record<string, any>, Record<string, string>> {
  return composeLoaders(variableExtractLoader(), variableContentLoader());
}

type VariableExtractionPayload = {
  variables: string[];
  value: string;
};

function variableExtractLoader(): ILoader<Record<string, string>, Record<string, VariableExtractionPayload>> {
  const specifierPattern = /%(?:\d+\$)?[+-]?(?:[ 0]|'.)?-?\d*(?:\.\d+)?(?:[hljztL]|ll|hh)?[@diuoxXfFeEgGaAcspn%]/g;
  return createLoader({
    pull: async (locale, input) => {
      const result: Record<string, VariableExtractionPayload> = {};
      for (const [key, value] of Object.entries(input)) {
        const matches = value.match(specifierPattern) || [];
        result[key] = result[key] || {
          value,
          variables: [],
        };
        for (let i = 0; i < matches.length; i++) {
          const match = matches[i];
          const currentValue = result[key].value;
          const newValue = currentValue.replace(match, `{variable:${i}}`);

          result[key].value = newValue;
          result[key].variables[i] = match;
        }
      }
      return result;
    },
    push: async (locale, data) => {
      const result: Record<string, string> = {};
      for (const [key, valueObj] of Object.entries(data)) {
        result[key] = valueObj.value;
        for (let i = 0; i < valueObj.variables.length; i++) {
          const variable = valueObj.variables[i];
          const currentValue = result[key];
          const newValue = currentValue.replace(`{variable:${i}}`, variable);
          result[key] = newValue;
        }
      }
      console.log("variableExtractLoader.push", result);
      return result;
    },
  });
}

function variableContentLoader(): ILoader<Record<string, VariableExtractionPayload>, Record<string, string>> {
  return createLoader({
    pull: async (locale, input) => {
      const result = _.mapValues(input, (payload) => payload.value);
      return result;
    },
    push: async (locale, data, originalInput) => {
      const result: Record<string, VariableExtractionPayload> = _.cloneDeep(originalInput || {});
      for (const [key, originalValueObj] of Object.entries(result)) {
        result[key] = {
          ...originalValueObj,
          value: data[key],
        };
      }
      return result;
    },
  });
}
