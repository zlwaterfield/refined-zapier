import delegate from 'delegate-it';

import features from '.';
import {isZaps}  from '../helpers/page-detect';
import {onDashboardZapHover} from '../events/on-div-hover';

function handleZapHover(event: delegate.Event<MouseEvent>): void {
    const zapId = event.delegateTarget.getAttribute('data-zap-id');
    if (event.type === 'mouseover') {
        // Load the information to display in the hover (if needed)
        // Create the tooltip hover to show if needed.
        // Show the hover.
        console.log("Will show hover for zapId: " + zapId);
    } else if (event.type === 'mouseout') {
        // Hide the hover.
        console.log("Will hide hover for zapId: " + zapId);
    }
}

async function init(): Promise<false | void> {
    onDashboardZapHover(handleZapHover);
    // Pre-cache the hover information
}

void features.add(__filebasename, {
    include: [
        isZaps
    ],
    init
});
