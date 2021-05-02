import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';

import elementReady from 'element-ready';

import features from '.';
import './commit-messages.css';
import {isZapEditor} from '../helpers/page-detect';
import {isZapNameSet} from '../helpers/is-zap-name-set';
import {onTurnZapOnToggleSwitchEnabled} from '../events/on-toggle-switch-enabled';
import {onTurnZapOnButtonClicked} from '../events/on-button-clicked';
import {fetchZapDetails, fetchCurrentUser, updateZapDescription} from '../helpers/api';

const DESCRIPTION_SPLIT_MESSAGE = '==========Do not edit below this line==========';

const renderModal = (): void => {
  const element = select('.flow-container__app-bar');
  element?.after(
    <div id="commit-message-modal" className="commit-message-modal">
      <div className="commit-message-modal-content">
        <span className="close" onClick={hideModal}>&times;</span>
        <h2>Add a message</h2>
        <p><b>This message will help track the change so people know what you did in the future.</b></p>
        <div className="commit-message-wrapper">
          <label className="form-label" htmlFor="commit-message">Message</label>
          <textarea className="form-control" id="commit-message" rows={4} placeholder="Updated the email copy"/>
        </div>
        <div className="actions-wrapper">
          <button type="button" className="publish-button" onClick={saveCommitMessage}>Publish with message</button>
          <button type="button" className="skip-button" onClick={skipCommitMessage}>Skip message and publish</button>
        </div>
      </div>
    </div>
  );
};

const simulateClick = (): void => {
  select('input[aria-label="On off switch"]')?.click();
};

const saveCommitMessage = async (): Promise<void> => {
  disableButtons();
  // @ts-expect-error
  const message = select('#commit-message')?.value;
  await formatZapDescription(message as string);
  hideModal();
  enableButtons();
  simulateClick();
};

const skipCommitMessage = async (): Promise<void> => {
  disableButtons();
  await formatZapDescription('No message');
  hideModal();
  enableButtons();
  simulateClick();
};

const formatZapDescription = async (message: string): Promise<void> => {
  // Get ZapId from URL
  let zapId;
  if (location.pathname.includes('/nodes')) {
    const afterIndex = location.pathname.indexOf('/nodes');
    zapId = location.pathname.slice(12, afterIndex);
  } else {
    zapId = location.pathname.slice(12, location.pathname.length);
  }

  // Get current user
  const currentUser = await fetchCurrentUser();
  const {email} = currentUser;

  // Get the Zap details
  const zapDetails = await fetchZapDetails(zapId);

  // Parse the existing Zap description and build the new one
  const existingWholeDescription = zapDetails.description;
  existingWholeDescription.includes(DESCRIPTION_SPLIT_MESSAGE);
  const [existingDescription, existingCommits] = existingWholeDescription.split(DESCRIPTION_SPLIT_MESSAGE);
  const description = `${existingDescription}${DESCRIPTION_SPLIT_MESSAGE}

Date: ${(new Date()).toString()}
User: ${email}
Message: ${message}
${existingCommits || ''}`;
  await updateZapDescription(zapId, description);
  select('body')?.classList.add('commit-message-saved');
};

const showModal = (): void => {
  const modal = select('.commit-message-modal');
  modal!.style.display = 'block';

  const body = select('body');
  body!.style.overflow = 'hidden';
};

const hideModal = (): void => {
  const modal = select('.commit-message-modal');
  modal!.style.display = 'none';

  const body = select('body');
  body!.style.overflow = 'auto';
};

const disableButtons = (): void => {
  const publishButton = select('button.publish-button');
  publishButton!.disabled = true;

  const skipButton = select('button.skip-button');
  skipButton!.disabled = true;
};

const enableButtons = (): void => {
  const publishButton = select('button.publish-button');
  publishButton!.disabled = false;

  const skipButton = select('button.skip-button');
  skipButton!.disabled = false;
};

const handleZapActivated = async (event: delegate.Event<MouseEvent>): Promise<void> => {
  const commitMessageSaved = select('body.commit-message-saved');
  console.log(commitMessageSaved);
  if (isZapNameSet() && !commitMessageSaved) {
    showModal();
    console.log('event.stopPropagation();');
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
