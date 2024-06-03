import * as t from '@babel/types';
import { createWorker } from '../../base';

const localizableAttributes: Record<string, string[]> = {
  '': ['title'], // Default localizable attributes that any element can have.
  input: ['placeholder'],
  img: ['alt'],
  meta: ['content'],
  option: ['label'],
};
/**
 * Extracts I18n fragments from JSXElements that have an attribute with a localizable value.
 */
export default createWorker<t.JSXElement>({
});
