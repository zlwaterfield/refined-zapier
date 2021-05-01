import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';

import elementReady from 'element-ready';

import features from '.';
import './commit-messages.css';
import * as api from '../helpers/api';
import {isZapEditor} from '../helpers/page-detect';
import {isZapNameSet} from '../helpers/is-zap-name-set';
import {onTurnZapOnToggleSwitchEnabled} from '../events/on-toggle-switch-enabled';
import {onTurnZapOnButtonClicked} from '../events/on-button-clicked';

const renderModal = (): void => {
	const element = select('.flow-container__app-bar');
	console.log('el', element);
	element?.after(
		<div id="commit-message-modal" className="commit-message-modal">
			<div className="commit-message-modal-content">
				<span className="close" onClick={hideModal}>&times;</span>
				<h1>Add a message describing your change</h1>
				<p>This message will help track the change so people know what you did in the future.</p>
				<p className="logged-in-user">
					<span>Logged In User:</span>
					<p className="logged-in-user-email"/>
				</p>
				<div>
					<label>Message</label>
					<textarea/>
				</div>
				<button type="button" onClick={saveCommitMessage}>Publish change</button>
			</div>
		</div>
	);
};

async function fetchCurrentUser(): Promise<unknown> {
	const response = await api.v2(
		'accountsDataQuery',
		{},
		`query accountsDataQuery {
      accounts {
        id
        normalizedImageUrl
        normalizedName
        __typename
      }
      currentUserV2 {
        id
        email
        __typename
      }
    }`
	);
	return response;
}

async function updateZapDescription(zapId: string, description: string): Promise<unknown> {
	const response = await api.v2(
		'SetZapDescription',
		{id: zapId, description},
		`mutation SetZapDescription($id: ID!, $description: String!) {
      setZapDescription(id: $id, description: $description) {
        description
        id
        __typename
      }
    }`
	);
	return response;
}

const saveCommitMessage = async () : Promise<void> => {
	await updateZapDescription('119978875', 'description');
	hideModal();
};

const showModal = () : void => {
	const modal = select('.commit-message-modal');
	modal!.style.display = 'block';

	const body = select('body');
	body!.style.overflow = 'hidden';
};

const hideModal = () : void => {
	const modal = select('.commit-message-modal');
	modal!.style.display = 'none';

	const body = select('body');
	body!.style.overflow = 'auto';
};

const handleZapActivated = async (event: delegate.Event<MouseEvent>): Promise<void> => {
	console.log(isZapNameSet());
	if (isZapNameSet()) {
		showModal();
		const currentUser = await fetchCurrentUser();
		const loggedInUserEmailElement = select('.logged-in-user-email');
		if (loggedInUserEmailElement) {
			// @ts-expect-error
			loggedInUserEmailElement.textContent = currentUser.currentUserV2.email;
		}

		event.stopPropagation();
	}
};

async function init(): Promise<false | void> {
	await elementReady('.flow-container__app-bar', {
		stopOnDomReady: false
	});

	renderModal();
	onTurnZapOnToggleSwitchEnabled(handleZapActivated);
	onTurnZapOnButtonClicked(handleZapActivated);
}

void features.add(__filebasename, {
	include: [
		isZapEditor
	],
	init
});
