import delegate from 'delegate-it'

import features from '.';
import { isZapEditor } from '../helpers/page-detect';
import {onTurnZapOnTooltipEnabled} from '../events/on-tooltip-enabled';


function handleZapActivated(event: delegate.Event<MouseEvent>): void {
    if (!isZapNameOk()) {
        console.log("Zap name is not ok. Activation should be prevented.");
        event.stopPropagation();
    }
}

function isZapNameOk(): boolean {
    const heading = document.querySelector('h1, .generic-heading')
    if (heading === null) return false;
    const zapName = heading.textContent;
    return zapName !== null && zapName.length > 0 && zapName !== 'Name your zap';
}

async function init(): Promise<false | void> {
	onTurnZapOnTooltipEnabled(handleZapActivated);
}

void features.add(__filebasename, {
  include: [
    isZapEditor
  ],
	init
});
