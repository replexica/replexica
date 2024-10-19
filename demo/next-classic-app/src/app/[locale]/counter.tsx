'use client';

import { useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';

// Example of a client component
export default function Counter() {
  const intl = useIntl();

  const [count, setCount] = useState(0);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);

  return (
    <div>
      <h2>
        <FormattedMessage id="counter.title" values={{ count }} />
      </h2>
      <button onClick={decrement}>
        {intl.formatMessage({id: 'counter.decrement'})} {/* Example of using the intl object */}
      </button>
      <button onClick={increment}>
        <FormattedMessage id="counter.increment" /> {/* Example of using the FormattedMessage component */}
      </button>
    </div>
  );
}
