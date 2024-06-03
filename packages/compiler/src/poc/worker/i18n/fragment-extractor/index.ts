import { composeWorkers, createWorker } from '../../base';
import attribute from './attribute';
import naked from './naked';
import simple from './simple';

/**
 * Labels I18n fragments.
 */
export default createWorker({
  next: composeWorkers(
    simple(),
    naked(),
    attribute(),
  ),
});
