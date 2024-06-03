import * as t from '@babel/types';
import { createWorker } from '../../base';

/**
 * Extracts I18n Fragments from JSXText elements that are children of a JSXElement and have a sibling non-JSXText element.
 */
export default createWorker<t.JSXText>({
  shouldRun: ({ nodePath }) => {
    return true;
  },
});