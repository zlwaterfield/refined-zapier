import 'typed-query-selector';
import select from 'select-dom';

import './refined-zapier.css';

// DO NOT add CSS files here if they are part of a JavaScript feature.
// Import the `.css` file from the `.tsx` instead.

// CSS-only disableable features
import './features/load-styles';
import './features/improved-sidebar';
import './features/disable-submit-without-zap-name';

// Add global for easier debugging
(window as any).select = select;
