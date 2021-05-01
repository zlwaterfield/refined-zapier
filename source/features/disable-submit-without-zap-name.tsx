import delegate from 'delegate-it';

import features from '.';
import {isZapEditor} from '../helpers/page-detect';
import {onTurnZapOnButtonClicked} from '../events/on-button-clicked';
import {onTurnZapOnToggleSwitchEnabled} from '../events/on-toggle-switch-enabled';
import { isZapNameSet } from '../helpers/is-zap-name-set';

function handleZapActivated(event: delegate.Event<MouseEvent>): void {
	if (!isZapNameSet()) {
		// TODO: Improve the UX presented here.
		alert("Please set a zap name to continue.");
		event.stopPropagation();
	}
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
