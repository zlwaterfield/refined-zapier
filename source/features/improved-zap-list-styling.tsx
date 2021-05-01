import React from 'dom-chef';
import elementReady from 'element-ready';
import select from 'select-dom';

import './improved-zap-list-styling.css';
import features from '.';
import {isZaps} from '../helpers/page-detect';

async function init(): Promise<false | void> {
	await elementReady('input[aria-label="Filter Zaps…"]', {
		stopOnDomReady: false
	});
	await elementReady('.zap-list-header', {
		stopOnDomReady: false
	});

	const header = select('[class*="ZapsListingPage--headerStyle"]');
	header!.after(
		<section data-css-reset="true" className="zap-search-section"/>
	);

	const zapListHeader = select('.zap-list-header');
	const filterZapsInput = document.querySelector('input[aria-label="Filter Zaps…"]');
	if (filterZapsInput?.parentElement) {
		zapListHeader!.parentElement?.parentElement?.before(filterZapsInput.parentElement);
	}
}

void features.add(__filebasename, {
	include: [
		isZaps
	],
	init
});
