import Z from "zod";
import { bucketTypeSchema } from "@replexica/spec";
import { composeLoaders } from "./_utils";
import createJsonLoader from "./json";
import createFlatLoader from "./flat";
import createTextFileLoader from "./text-file";
import createYamlLoader from "./yaml";
import createRootKeyLoader from "./root-key";
import createFlutterLoader from "./flutter";
import { ILoader } from "./_types";
import createAndroidLoader from "./android";
import createCsvLoader from "./csv";
import createHtmlLoader from "./html";
import createMarkdownLoader from "./markdown";
import createPropertiesLoader from "./properties";
import createXcodeStringsLoader from "./xcode-strings";
import createXcodeStringsdictLoader from "./xcode-stringsdict";
import createXcodeXcstringsLoader from "./xcode-xcstrings";
import createPrettierLoader from "./prettier";
import createUnlocalizableLoader from "./unlocalizable";
import createPoLoader from "./po";
import createXliffLoader from "./xliff";
import createXmlLoader from "./xml";
import createSrtLoader from "./srt";
import createDatoLoader from "./dato";
import createVariableLoader from "./variable";

export default function createBucketLoader(
  bucketType: Z.infer<typeof bucketTypeSchema>,
  bucketPathPattern: string,
): ILoader<void, Record<string, string>> {
  switch (bucketType) {
    default:
      throw new Error(`Unsupported bucket type: ${bucketType}`);
    case "android":
      return composeLoaders(
        createTextFileLoader(bucketPathPattern),
        createAndroidLoader(),
        createFlatLoader(),
        createUnlocalizableLoader(),
      );
    case "csv":
      return composeLoaders(
        createTextFileLoader(bucketPathPattern),
        createCsvLoader(),
        createFlatLoader(),
        createUnlocalizableLoader(),
      );
    case "html":
      return composeLoaders(
        createTextFileLoader(bucketPathPattern),
        createPrettierLoader({ parser: "html", alwaysFormat: true }),
        createHtmlLoader(),
        createUnlocalizableLoader(),
      );
    case "json":
      return composeLoaders(
        createTextFileLoader(bucketPathPattern),
        createPrettierLoader({ parser: "json" }),
        createJsonLoader(),
        createFlatLoader(),
        createUnlocalizableLoader(),
      );
    case "markdown":
      return composeLoaders(
        createTextFileLoader(bucketPathPattern),
        createPrettierLoader({ parser: "markdown" }),
        createMarkdownLoader(),
        createUnlocalizableLoader(),
      );
    case "po":
      return composeLoaders(
        createTextFileLoader(bucketPathPattern),
        createPoLoader(),
        createFlatLoader(),
        createUnlocalizableLoader(),
      );
    case "properties":
      return composeLoaders(
        createTextFileLoader(bucketPathPattern),
        createPropertiesLoader(),
        createUnlocalizableLoader(),
      );
    case "xcode-strings":
      return composeLoaders(
        createTextFileLoader(bucketPathPattern),
        createXcodeStringsLoader(),
        createUnlocalizableLoader(),
      );
    case "xcode-stringsdict":
      return composeLoaders(
        createTextFileLoader(bucketPathPattern),
        createXcodeStringsdictLoader(),
        createFlatLoader(),
        createUnlocalizableLoader(),
      );
    case "xcode-xcstrings":
      return composeLoaders(
        createTextFileLoader(bucketPathPattern),
        createPrettierLoader({ parser: "json" }),
        createJsonLoader(),
        createXcodeXcstringsLoader(),
        createFlatLoader(),
        createVariableLoader({ type: "ieee" }),
        createUnlocalizableLoader(),
      );
    case "yaml":
      return composeLoaders(
        createTextFileLoader(bucketPathPattern),
        createPrettierLoader({ parser: "yaml" }),
        createYamlLoader(),
        createFlatLoader(),
        createUnlocalizableLoader(),
      );
    case "yaml-root-key":
      return composeLoaders(
        createTextFileLoader(bucketPathPattern),
        createPrettierLoader({ parser: "yaml" }),
        createYamlLoader(),
        createRootKeyLoader(true),
        createFlatLoader(),
        createUnlocalizableLoader(),
      );
    case "flutter":
      return composeLoaders(
        createTextFileLoader(bucketPathPattern),
        createPrettierLoader({ parser: "json" }),
        createJsonLoader(),
        createFlutterLoader(),
        createFlatLoader(),
        createUnlocalizableLoader(),
      );
    case "xliff":
      return composeLoaders(
        createTextFileLoader(bucketPathPattern),
        createXliffLoader(),
        createFlatLoader(),
        createUnlocalizableLoader(),
      );
    case "xml":
      return composeLoaders(
        createTextFileLoader(bucketPathPattern),
        createXmlLoader(),
        createFlatLoader(),
        createUnlocalizableLoader(),
      );
    case "srt":
      return composeLoaders(createTextFileLoader(bucketPathPattern), createSrtLoader(), createUnlocalizableLoader());
    case "dato":
      return composeLoaders(createDatoLoader(bucketPathPattern), createFlatLoader());
  }
}
