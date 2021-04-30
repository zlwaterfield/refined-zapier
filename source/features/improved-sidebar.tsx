import './improved-sidebar.css';

import features from '.';
import { isDashboard, isMayZaps, isZapHistory, isZaps } from '../helpers/page-detect';

async function init(): Promise<false | void> {}

void features.add(__filebasename, {
  include: [
    isZaps,
    isMayZaps,
    isDashboard,
    isZapHistory
  ],
	init
});
