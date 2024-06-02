import { createI18nMiddleware } from '@replexica/react/next';
import i18nConfig from './../i18n.json';

export default createI18nMiddleware(i18nConfig as any)();