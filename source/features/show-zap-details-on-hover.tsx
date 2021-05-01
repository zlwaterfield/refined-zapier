import React from 'dom-chef';
import delegate from 'delegate-it';
import select from 'select-dom';

import features from '.';
import './show-zap-details-on-hover.css';
import * as api from '../helpers/api';
import {isZaps} from '../helpers/page-detect';
import {onDashboardZapHover} from '../events/on-div-hover';

const friendlyNameForApis = new Map<string, string>([
	// TODO: Add more APIs here.
	['GoogleMailV2API', 'GMail'],
	['GoogleDocsV2API', 'Google Docs'],
	['GoogleDriveAPI', 'Google Drive'],
	['GoogleCalendarAPI', 'Google Calendar'],
	['GoogleSheetsV2API', 'Google Sheets']
]);

async function handleZapHover(event: delegate.Event<MouseEvent>): Promise<void> {
	const zapIconsDiv = event.delegateTarget;
	const zapIconsDivWrapper = zapIconsDiv.parentElement?.parentElement?.parentElement;
	const zapId = zapIconsDivWrapper!.getAttribute('data-zap-id');
	if (zapId === null) {
		console.log('Unexpected missing zapId');
		return;
	}

	if (event.type === 'mouseover') {
		const overview = await fetchZapOverview(zapId);
		console.log(overview);
		const existingTooltip = select(`#icon-tooltip-${zapId}`);
		if (existingTooltip) {
			existingTooltip.classList.remove('hide-tooltip');
		} else {
			event.delegateTarget.after(
				<div id={`icon-tooltip-${zapId}`} className="icon-tooltip">
					<ul>
						{overview.appsUsed.map(a => (
							<li key={a}>{a}</li>
						))}
					</ul>
				</div>
			);
		}
	} else if (event.type === 'mouseout') {
		select(`#icon-tooltip-${zapId}`)?.classList.add('hide-tooltip');
	}
}

interface ZapOverview {
	description: string;
	appsUsed: string[];
	stepTitles: string[];
}

async function fetchZapOverview(zapId: string): Promise<ZapOverview> {
	const response = await api.v2(
		/* OperationName */ 'zapQuery',
		/* Variables */ {zapId},
		/* Query */ `query zapQuery($zapId: ID!) {
            zapV2(id: $zapId) {
                description
                id
                nodes {
                     selectedApi
                     type
                     __typename
                }
                __typename
            }
        }`);
	return {
		description: response.zapV2.description,
		appsUsed: response.zapV2.nodes.map((n: {selectedApi: string}) => apiNameToUse(n.selectedApi)),
		stepTitles: []
	};
}

function apiNameToUse(apiName: string): string {
	if (friendlyNameForApis.has(apiName)) {
		return friendlyNameForApis.get(apiName)!;
	}

	return apiName;
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
