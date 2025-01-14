import Z from "zod";

export default async function loadEnv() {
  return Z.object({
    // Replexica
    REPLEXICA_API_KEY: Z.string(),
    REPLEXICA_PULL_REQUEST: Z.preprocess(
      (val) => val === "true" || val === true,
      Z.boolean(),
    ),
    REPLEXICA_COMMIT_MESSAGE: Z.string(),
    REPLEXICA_PULL_REQUEST_TITLE: Z.string(),
    // Github
    GITHUB_REPOSITORY: Z.string(),
    GITHUB_REPOSITORY_OWNER: Z.string(),
    GITHUB_REF: Z.string(),
    GITHUB_REF_NAME: Z.string(),
    GITHUB_HEAD_REF: Z.string(),
    // Custom env
    GH_TOKEN: Z.string().optional(),
  }).parse(process.env);
}
