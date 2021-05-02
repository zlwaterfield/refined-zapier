import React from 'dom-chef';
import delegate from 'delegate-it';
import select from 'select-dom';

import features from '.';
import './show-zap-details-on-hover.css';
import {isZaps} from '../helpers/page-detect';
import {onDashboardZapHover} from '../events/on-div-hover';
import { fetchZapDetails } from '../helpers/api';

async function handleZapHover(event: delegate.Event<MouseEvent>): Promise<void> {
	const zapIconsDiv = event.delegateTarget;
	const zapIconsDivWrapper = zapIconsDiv.parentElement?.parentElement?.parentElement;
	const zapId = zapIconsDivWrapper!.getAttribute('data-zap-id');
	if (zapId === null) {
		console.log('Unexpected missing zapId');
		return;
	}

	if (event.type === 'mouseover') {
		const overview = await fetchZapDetails(zapId);
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
