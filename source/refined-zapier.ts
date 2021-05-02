import 'typed-query-selector';
import select from 'select-dom';

import './refined-zapier.css';
import './features/load-styles';

// DO NOT add CSS files here if they are part of a JavaScript feature.
// Import the `.css` file from the `.tsx` instead.

// CSS-only disableable features
import './features/commit-messages';
import './features/disable-submit-without-zap-name';
import './features/format-zap-description';
import './features/improved-sidebar-styling';
import './features/improved-zap-list-styling';
import './features/folder-searching';
import './features/show-zap-details-on-hover';
import './features/improved-zap-editor-styling';

// Add global for easier debugging
(window as any).select = select;
