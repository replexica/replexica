import { joinWorkers } from '../../base';
import attribute from './attribute';
import naked from './naked';
import simple from './simple';

export default joinWorkers(
  simple(),
  naked(),
  attribute(),
);
