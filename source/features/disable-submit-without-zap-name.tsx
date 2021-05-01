import delegate from 'delegate-it';

import features from '.';
import {isZapEditor} from '../helpers/page-detect';
import {onTurnZapOnButtonClicked} from '../events/on-button-clicked';
import {onTurnZapOnToggleSwitchEnabled} from '../events/on-toggle-switch-enabled';


function handleZapActivated(event: delegate.Event<MouseEvent>): void {
    if (!isZapNameOk()) {
        console.log("Zap name is not ok. Activation should be prevented.");
        // TODO: Improve the UX presented here.
        alert("Please set a zap name to continue.");
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
	onTurnZapOnToggleSwitchEnabled(handleZapActivated);
    onTurnZapOnButtonClicked(handleZapActivated);
}

void features.add(__filebasename, {
  include: [
    isZapEditor
  ],
  init
});
