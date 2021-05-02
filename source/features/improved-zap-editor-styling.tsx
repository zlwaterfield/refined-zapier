import './improved-zap-editor-styling.css';
import features from '.';
import {isZapEditor} from '../helpers/page-detect';

async function init(): Promise<false | void> {
  // This is all done via styling
}

void features.add(__filebasename, {
	include: [
		isZapEditor
	],
	init
});
