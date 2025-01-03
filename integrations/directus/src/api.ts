import { defineOperationApi } from '@directus/extensions-sdk';

interface Options {
	item_id: string;
	collection: string;
	translation_table: string;
	language_table: string;
	replexica_api_key: string;
	source_language?: string;
  target_languages: string[];
}

interface Context {
	services: {
		ItemsService: any;
	};
	getSchema: () => Promise<any>;
}

interface TranslationResult {
	success: boolean;
	language: string;
	operation?: 'updated' | 'created';
	data?: any;
	error?: string;
}

interface TranslationSummary {
	successful: number;
	failed: number;
	updated: number;
	created: number;
	details: TranslationResult[];
}

export default defineOperationApi<Options>({
	id: 'replexica-integration-directus',
	handler: async ({ item_id, collection, translation_table, language_table, replexica_api_key, source_language = 'en-US', target_languages }, context: Context) => {
		if (!replexica_api_key) {
			throw new Error('Replexica API Key not defined');
		}


		try {
			const { ReplexicaEngine } = await import('@replexica/sdk');
			const replexica = new ReplexicaEngine({ apiKey: replexica_api_key });

			const { ItemsService } = context.services;
			const schema = await context.getSchema();

			// Initialize services
			const languagesService = new ItemsService(language_table, { schema });
			const translationsService = new ItemsService(translation_table, { schema });

			// Get the primary key field for the collection
      const collection_pk = schema.collections[collection].primary;

			// Get collection fields and their types
			const collectionFields = schema.collections[translation_table].fields;

			// Get all existing translations for this item
			const existingTranslations = await translationsService.readByQuery({
				fields: ['*'],
				filter: {
					[`${collection}_${collection_pk}`]: { _eq: item_id }
				}
			});

			const sourceTranslation = existingTranslations.find((t: { languages_code: string }) => t.languages_code === source_language);
			if (!sourceTranslation) {
				throw new Error('No source translation found');
			}

			// Get target languages
			const targetLanguages = await languagesService.readByQuery({
				fields: ['code', 'name'],
				filter: target_languages && target_languages.length > 0					
          ? { code: { _in: target_languages } }
					: { code: { _neq: source_language } }
			});

			if (!targetLanguages.length) {
				throw new Error(target_languages
					? `Target language ${target_languages} not found in language table`
					: 'No target languages found in table'
				);
			}

			// Prepare translation template
			const translationTemplate = {
				...sourceTranslation,
				id: undefined,
				languages_code: undefined,
				date_created: undefined,
				date_updated: undefined,
				user_created: undefined,
				user_updated: undefined
			};

			// Process translations
			const results: TranslationResult[] = await Promise.all(
				targetLanguages.map(async (language: { code: string; name: string }) => {
					try {
						let translatedData: Record<string, any> = {};
						let objectToTranslate: Record<string, any> = {};
						let textFields: Array<{ fieldName: string; fieldValue: string }> = [];

						// Separate fields into text and non-text
						for (const [fieldName, fieldValue] of Object.entries(translationTemplate)) {
							// Skip if field is null or undefined
							if (fieldValue == null) {
								translatedData[fieldName] = fieldValue;
								continue;
							}

							// Skip system fields and non-translatable fields
							const fieldSchema = collectionFields[fieldName];
							if (!fieldSchema || fieldSchema.system) {
								translatedData[fieldName] = fieldValue;
								continue;
							}

							if (fieldSchema.type === 'text') {
								textFields.push({ fieldName, fieldValue: fieldValue as string });
							} else {
								objectToTranslate[fieldName] = fieldValue;
							}
						}

						// Translate non-text fields in one batch
						if (Object.keys(objectToTranslate).length > 0) {
							const translatedObject = await replexica.localizeObject(
								objectToTranslate,
								{
									sourceLocale: source_language,
									targetLocale: language.code
								}
							);
							translatedData = { ...translatedData, ...translatedObject };
						}

						// Translate text fields individually
						for (const { fieldName, fieldValue } of textFields) {
							try {
								if (isHtml(fieldValue)) {
									translatedData[fieldName] = await replexica.localizeHtml(
										fieldValue,
										{
											sourceLocale: source_language,
											targetLocale: language.code
										}
									);
								} else {
									translatedData[fieldName] = await replexica.localizeText(
										fieldValue,
										{
											sourceLocale: source_language,
											targetLocale: language.code
										}
									);
								}
							} catch (fieldError) {
								console.error(`Error translating field ${fieldName}:`, fieldError);
								translatedData[fieldName] = fieldValue; // Keep original value on error
							}
						}

						// Find existing translation for this language
						const existingTranslation = existingTranslations.find(
							(t: { languages_code: string }) => t.languages_code === language.code
						);

						let result;
						if (existingTranslation) {
							result = await translationsService.updateOne(
								existingTranslation.id,
								{
									...translatedData,
									languages_code: language.code
								}
							);
						} else {
							result = await translationsService.createOne({
								...translatedData,
								languages_code: language.code,
								[`${collection}_${collection_pk}`]: item_id
							});
						}

						return {
							success: true,
							language: language.code,
							operation: existingTranslation ? 'updated' : 'created',
							data: result
						};
					} catch (error) {
						return {
							success: false,
							language: language.code,
							error: error instanceof Error ? error.message : 'Unknown error'
						};
					}
				})
			);
      
      
      const requestedLanguages = new Set(target_languages || []);
      const missingLanguages = target_languages?.filter(
        code => !targetLanguages.find((lang: { code: string }) => lang.code === code)
      ) || [];

      const missingResults: TranslationResult[] = missingLanguages.map(code => ({
        success: false,
        language: code,
        error: `Language ${code} not found in language table`
      }));

			const allResults = [...results, ...missingResults];
      
      const summary: TranslationSummary = {
        successful: allResults.filter(r => r.success).length,
        failed: allResults.filter(r => !r.success).length,
        updated: allResults.filter(r => r.operation === 'updated').length,
        created: allResults.filter(r => r.operation === 'created').length,
        details: allResults
      };

			return summary;

		} catch (error) {
			throw new Error(`Translation process failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}
});

// Helper functions
function isHtml(text: string): boolean {
	const htmlRegex = /<[a-z][\s\S]*>/i;
	return htmlRegex.test(text);
}
