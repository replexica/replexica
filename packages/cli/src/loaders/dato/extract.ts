import _ from "lodash";
import { ILoader } from "../_types";
import { createLoader } from "../_utils";
import { DatoFilterLoaderOutput } from "./filter";
import fs from "fs";
import Z from "zod";

export type DatoExtractLoaderOutput = {
  [modelId: string]: {
    [recordId: string]: {
      [fieldName: string]: string | Record<string, object>;
    };
  };
};

export default function createDatoExtractLoader(): ILoader<DatoFilterLoaderOutput, DatoExtractLoaderOutput> {
  return createLoader({
    async pull(locale, input) {
      const result: DatoExtractLoaderOutput = {};

      for (const [modelId, modelInfo] of _.entries(input)) {
        for (const [recordId, record] of _.entries(modelInfo)) {
          for (const [fieldName, fieldValue] of _.entries(record)) {
            const parsedValue = createParsedDatoValue(fieldValue);
            if (parsedValue) {
              _.set(result, [modelId, `_${recordId}`, fieldName], parsedValue);
            }
          }
        }
      }

      return result;
    },
    async push(locale, data, originalInput) {
      const result = _.cloneDeep(originalInput || {});

      for (const [modelId, modelInfo] of _.entries(data)) {
        for (const [virtualRecordId, record] of _.entries(modelInfo)) {
          for (const [fieldName, fieldValue] of _.entries(record)) {
            const [, recordId] = virtualRecordId.split("_");
            const originalFieldValue = _.get(originalInput, [modelId, recordId, fieldName]);
            const rawValue = createRawDatoValue(fieldValue, originalFieldValue, true);
            _.set(result, [modelId, recordId, fieldName], rawValue || originalFieldValue);
          }
        }
      }

      return result;
    },
  });
}

export type DatoValueRaw = any;
export type DatoValueParsed = any;

export function detectDatoFieldType(rawDatoValue: DatoValueRaw): string | null {
  if (_.has(rawDatoValue, "document") && _.get(rawDatoValue, "schema") === "dast") {
    return "structured_text";
  } else if (_.has(rawDatoValue, "no_index") || _.has(rawDatoValue, "twitter_card")) {
    return "seo";
  } else if (_.get(rawDatoValue, "type") === "item") {
    return "single_block";
  } else if (_.isArray(rawDatoValue) && _.every(rawDatoValue, (item) => _.get(item, "type") === "item")) {
    return "rich_text";
  } else if (_isFile(rawDatoValue)) {
    return "file";
  } else if (_.isArray(rawDatoValue) && _.every(rawDatoValue, (item) => _isFile(item))) {
    return "gallery";
  } else if (_isJson(rawDatoValue)) {
    return "json";
  } else if (_.isString(rawDatoValue)) {
    return "string";
  } else if (_isVideo(rawDatoValue)) {
    return "video";
  } else if (_.isArray(rawDatoValue) && _.every(rawDatoValue, (item) => _.isString(item))) {
    return "ref_list";
  } else {
    return null;
  }
}

export function createParsedDatoValue(rawDatoValue: DatoValueRaw): DatoValueParsed {
  const fieldType = detectDatoFieldType(rawDatoValue);
  switch (fieldType) {
    default:
      return rawDatoValue;
    case "structured_text":
      return serializeStructuredText(rawDatoValue);
    case "seo":
      return serializeSeo(rawDatoValue);
    case "single_block":
      return serializeBlock(rawDatoValue);
    case "rich_text":
      return serializeBlockList(rawDatoValue);
    case "json":
      return JSON.parse(rawDatoValue);
    case "video":
      return serializeVideo(rawDatoValue);
    case "file":
      return serializeFile(rawDatoValue);
    case "gallery":
      return serializeGallery(rawDatoValue);
    case "ref_list":
      return null;
  }
}

export function createRawDatoValue(
  parsedDatoValue: DatoValueParsed,
  originalRawDatoValue: any,
  isClean = false,
): DatoValueRaw {
  const fieldType = detectDatoFieldType(originalRawDatoValue);
  switch (fieldType) {
    default:
      return parsedDatoValue;
    case "structured_text":
      return deserializeStructuredText(parsedDatoValue, originalRawDatoValue);
    case "seo":
      return deserializeSeo(parsedDatoValue, originalRawDatoValue);
    case "single_block":
      return deserializeBlock(parsedDatoValue, originalRawDatoValue, isClean);
    case "rich_text":
      return deserializeBlockList(parsedDatoValue, originalRawDatoValue, isClean);
    case "json":
      return JSON.stringify(parsedDatoValue, null, 2);
    case "video":
      return deserializeVideo(parsedDatoValue, originalRawDatoValue);
    case "file":
      return deserializeFile(parsedDatoValue, originalRawDatoValue);
    case "gallery":
      return deserializeGallery(parsedDatoValue, originalRawDatoValue);
    case "ref_list":
      return originalRawDatoValue;
  }
}

function serializeStructuredText(rawStructuredText: any) {
  return serializeStructuredTextNode(rawStructuredText);
  // Encapsulates helper function args
  function serializeStructuredTextNode(node: any, path: string[] = [], acc: Record<string, any> = {}) {
    if ("document" in node) {
      return serializeStructuredTextNode(node.document, [...path, "document"], acc);
    }

    if (!_.isNil(node.value)) {
      acc[[...path, "value"].join(".")] = node.value;
    } else if (_.get(node, "type") === "block") {
      acc[[...path, "item"].join(".")] = serializeBlock(node.item);
    }

    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        serializeStructuredTextNode(node.children[i], [...path, i.toString()], acc);
      }
    }

    return acc;
  }
}

function serializeSeo(rawSeo: any) {
  return _.chain(rawSeo).pick(["title", "description"]).value();
}

function serializeBlock(rawBlock: any) {
  if (_.get(rawBlock, "type") === "item" && _.has(rawBlock, "id")) {
    return serializeBlock(rawBlock.attributes);
  }

  const result: Record<string, any> = {};
  for (const [attributeName, attributeValue] of _.entries(rawBlock)) {
    result[attributeName] = createParsedDatoValue(attributeValue);
  }

  return result;
}

function serializeBlockList(rawBlockList: any) {
  return _.chain(rawBlockList)
    .map((block) => serializeBlock(block))
    .value();
}

function serializeVideo(rawVideo: any) {
  return _.chain(rawVideo).pick(["title"]).value();
}

function serializeFile(rawFile: any) {
  return _.chain(rawFile).pick(["alt", "title"]).value();
}

function serializeGallery(rawGallery: any) {
  return _.chain(rawGallery)
    .map((item) => serializeFile(item))
    .value();
}

function deserializeFile(parsedFile: any, originalRawFile: any) {
  return _.chain(parsedFile).defaults(originalRawFile).value();
}

function deserializeGallery(parsedGallery: any, originalRawGallery: any) {
  return _.chain(parsedGallery)
    .map((item, i) => deserializeFile(item, originalRawGallery[i]))
    .value();
}

function deserializeVideo(parsedVideo: any, originalRawVideo: any) {
  return _.chain(parsedVideo).defaults(originalRawVideo).value();
}

function deserializeBlock(payload: any, rawNode: any, isClean = false) {
  const result = _.cloneDeep(rawNode);

  for (const [attributeName, attributeValue] of _.entries(rawNode.attributes)) {
    const rawValue = createRawDatoValue(payload[attributeName], attributeValue, isClean);
    _.set(result, ["attributes", attributeName], rawValue);
  }

  if (isClean) {
    delete result["id"];
  }

  return result;
}

function deserializeSeo(parsedSeo: any, originalRawSeo: any) {
  return _.chain(parsedSeo).pick(["title", "description"]).defaults(originalRawSeo).value();
}

function deserializeBlockList(parsedBlockList: any, originalRawBlockList: any, isClean = false) {
  return _.chain(parsedBlockList)
    .map((block, i) => deserializeBlock(block, originalRawBlockList[i], isClean))
    .value();
}

function deserializeStructuredText(parsedStructuredText: Record<string, string>, originalRawStructuredText: any) {
  const result = _.cloneDeep(originalRawStructuredText);

  for (const [path, value] of _.entries(parsedStructuredText)) {
    const realPath = _.chain(path.split("."))
      .flatMap((s) => (!_.isNaN(_.toNumber(s)) ? ["children", s] : s))
      .value();
    const deserializedValue = createRawDatoValue(value, _.get(originalRawStructuredText, realPath), true);
    _.set(result, realPath, deserializedValue);
  }

  return result;
}

function _isJson(rawDatoValue: DatoValueRaw): boolean {
  try {
    return (
      _.isString(rawDatoValue) &&
      rawDatoValue.startsWith("{") &&
      rawDatoValue.endsWith("}") &&
      !!JSON.parse(rawDatoValue)
    );
  } catch (e) {
    return false;
  }
}

function _isFile(rawDatoValue: DatoValueRaw): boolean {
  return (
    _.isObject(rawDatoValue) &&
    ["alt", "title", "custom_data", "focal_point", "upload_id"].every((key) => _.has(rawDatoValue, key))
  );
}

function _isVideo(rawDatoValue: DatoValueRaw): boolean {
  return (
    _.isObject(rawDatoValue) &&
    ["url", "title", "width", "height", "provider", "provider_uid", "thumbnail_url"].every((key) =>
      _.has(rawDatoValue, key),
    )
  );
}
