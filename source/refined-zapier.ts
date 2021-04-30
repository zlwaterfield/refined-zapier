import 'typed-query-selector';
import select from 'select-dom';

import './refined-zapier.css';
import './features/load-styles';

// DO NOT add CSS files here if they are part of a JavaScript feature.
// Import the `.css` file from the `.tsx` instead.

// CSS-only disableable features
import './features/disable-submit-without-zap-name';
import './features/improved-sidebar';
import './features/folder-searching';

// Add global for easier debugging
(window as any).select = select;
