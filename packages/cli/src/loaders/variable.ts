import _ from "lodash";
import { ILoader } from "./_types";
import { composeLoaders, createLoader } from "./_utils";

type VariableLoaderParams = {
  type: "ieee";
};

export default function createVariableLoader(
  params: VariableLoaderParams,
): ILoader<Record<string, any>, Record<string, string>> {
  return composeLoaders(variableExtractLoader(params), variableContentLoader());
}

type VariableExtractionPayload = {
  variables: string[];
  value: string;
};

function variableExtractLoader(
  params: VariableLoaderParams,
): ILoader<Record<string, string>, Record<string, VariableExtractionPayload>> {
  const specifierPattern = getFormatSpecifierPattern(params.type);
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

function getFormatSpecifierPattern(type: VariableLoaderParams["type"]): RegExp {
  switch (type) {
    case "ieee":
      return /%(?:\d+\$)?[+-]?(?:[ 0]|'.)?-?\d*(?:\.\d+)?(?:[hljztL]|ll|hh)?[@diuoxXfFeEgGaAcspn%]/g;
    default:
      throw new Error(`Unsupported variable format type: ${type}`);
  }
}
