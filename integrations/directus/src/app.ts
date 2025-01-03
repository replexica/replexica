import { defineOperationApp } from '@directus/extensions-sdk';

export default defineOperationApp({
	id: 'replexica-integration-directus',
	name: 'Replexica Integration for Directus',
	icon: 'translate',
	description: 'Use Replexica Localization Engine to make content multilingual.',
	overview: ({ collection }) => [
		{
			label: '$t:collection',
			text: collection,
		},
	],
	options: [
		{
			field: 'item_id',
			name: 'Item ID',
			type: 'string',
			meta: {
				interface: 'input',
				width: 'half',
			},
		},
		{
			field: 'collection',
			name: '$t:collection',
			type: 'string',
			meta: {
				interface: 'system-collection',
				options: {
					includeSystem: true,
					includeSingleton: false,
				},
				width: 'half',
			},
		},
		{
			field: 'source_language',
			name: 'Source Language',
			type: 'string',
			meta: {
				interface: 'input',
				width: 'half',
			},
		},
    {
			field: 'target_languages',
			name: 'Target Languages',
      type: 'string',
			meta: {
				interface: 'input',
				width: 'half',
			}
		},
		{
			field: 'translation_table',
			name: 'Translation Table',
			type: 'string',
			meta: {
				interface: 'system-collection',
				options: {
					includeSystem: true,
					includeSingleton: false,
				},
				width: 'half',
			},
		},
		{
			field: 'language_table',
			name: 'Languages Table',
			type: 'string',
			meta: {
				interface: 'system-collection',
				options: {
					includeSystem: true,
					includeSingleton: false,
				},
				width: 'half',
			},
		},
		{
			field: 'replexica_api_key',
			name: 'Replexica API Key',
			type: 'string',
			meta: {
				interface: 'input-hash',
				width: 'half',
				options: {
					masked: true,
					placeholder: 'Enter your Replexica API key'
				}
			},
		}

	],
});
