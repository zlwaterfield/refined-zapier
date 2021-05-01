import marked from 'marked';

import './improved-zap-list-styling.css';
import select from 'select-dom';
import elementReady from 'element-ready';
import sanitizeHtml from 'sanitize-html';

import {isZapDetails} from '../helpers/page-detect';
import features from '.';
import * as api from '../helpers/api';

marked.setOptions({
	gfm: true,
	breaks: true
});

const findDescriptionElement = (): HTMLSpanElement | undefined | null => {
	const detailTitles = select.all('div[class*="DetailItem--titleStyle"]');
	return detailTitles.find(dt => {
		const titleSpan = select('span', dt);
		return titleSpan!.textContent === 'Description';
	});
};

async function fetchZapDescription(zapId: string): Promise<unknown> {
	const response = await api.v2(
		'zapQuery',
		{zapId},
		`query zapQuery($zapId: ID!) {
      zapV2(id: $zapId) {
        description
        __typename
      }
    }`
	);
	return response.zapV2.description;
}

async function init(): Promise<false | void> {
	await elementReady('div[class*="DetailItem--rootStyle"]', {
		stopOnDomReady: false
	});

	const zapId = location.pathname.slice(9, location.pathname.length - 1);
	const existingDescription = await fetchZapDescription(zapId);
	if (!existingDescription) {
		return;
	}

	const sanitizedExistingDescription = sanitizeHtml(existingDescription as string);
	const sanitizedExistingDescriptionWithNewLines = sanitizedExistingDescription.replace(/\r\n|\r|\n|\\n/g, '<br>');
	const markdownDescription = marked(sanitizedExistingDescriptionWithNewLines);

	const descriptionElement = findDescriptionElement();
	const descriptionParagraph = descriptionElement?.nextSibling;
	if (!descriptionParagraph) {
		return;
	}

	// @ts-expect-error
	descriptionParagraph.innerHTML = markdownDescription;
}

void features.add(__filebasename, {
	include: [
		isZapDetails
	],
	init
});
