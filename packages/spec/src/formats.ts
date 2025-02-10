import Z from "zod";

export const bucketTypes = [
  "android",
  "csv",
  "flutter",
  "html",
  "ejs",
  "json",
  "markdown",
  "xcode-strings",
  "xcode-stringsdict",
  "xcode-xcstrings",
  "yaml",
  "yaml-root-key",
  "properties",
  "po",
  "xliff",
  "xml",
  "srt",
  "dato",
  "compiler",
  "vtt",
] as const;

export const bucketTypeSchema = Z.enum(bucketTypes);
