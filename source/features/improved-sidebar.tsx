import './improved-sidebar.css';

import features from '.';
import {isDashboard, isMyZaps, isZapHistory, isZaps} from '../helpers/page-detect';

async function init(): Promise<false | void> {
  // This is all done via styling
}

void features.add(__filebasename, {
	include: [
		isZaps,
		isMyZaps,
		isDashboard,
		isZapHistory
	],
	init
});
