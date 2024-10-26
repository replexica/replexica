// (async function main() {
//   const localizationEngine = createLocalizationEngine();
//   const config = await loadConfig();
//   const buckets = await findBuckets();
//   for (const [bucketType, bucketPath] of Object.entries(buckets)) {
//     const pathPatterns = extractPathPatterns(bucketPath);
//     for (const bucketPathPattern of pathPatterns) {
//       const sourceLoader = createBucketLoader(bucketType, bucketPathPattern).setLocale(config.locale.source);
//       for (const targetLocale of config.locale.targets) {
//         const targetLoader = createBucketLoader(bucketType, bucketPathPattern).setLocale(targetLocale);

//         const [sourceData, targetData] = await Promise.all([
//           sourceLoader.pull(),
//           targetLoader.pull(),
//         ]);
//         const processableData = createProcessableData(sourceData, targetData);

//         const processedData = await localizationEngine.process({
//           sourceData,
//           targetData,
//           processableData,
//         });

//         await targetLoader.push(processedData);
//       }
//     }
//   }
// })();
