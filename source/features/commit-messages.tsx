import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import delay from 'delay';

import features from '.';
import './commit-messages.css';
import {isZapEditor} from '../helpers/page-detect';
import {isZapNameSet} from '../helpers/is-zap-name-set';
import {onTurnZapOnToggleSwitchEnabled} from '../events/on-toggle-switch-enabled';
import {fetchZapDetails, fetchCurrentUser, updateZapDescription} from '../helpers/api';

export const DESCRIPTION_SPLIT_MESSAGE = '\n\n==========Do not edit below this line==========\n';

const renderModal = (): void => {
  const element = select('.flow-container__app-bar');
  element?.after(
    <div id="commit-message-modal" className="commit-message-modal hidden fixed left-0 top-0 w-full h-full overflow-auto z-50 bg-gray-300 bg-opacity-50">
      <div className="commit-message-modal-content bg-white w-9/12 max-w-3xl relative rounded-2xl border border border-gray-300 border-solid px-20 py-20 mx-auto mt-40">
        <span className="text-3xl cursor-pointer font-bold absolute top-4 right-5 text-gray-400 text-2xl hover:text-gray-800" onClick={hideModal}>&times;</span>
        <h2 className="text-5xl text-center">Add a message</h2>
        <p className="mt-6">This message will help track the change so people know what you did in the future.</p>
        <div className="commit-message-wrapper">
          <label className="form-label block mb-4" htmlFor="commit-message">Message</label>
          <textarea id="commit-message" className="form-control resize-y overflow-auto h-auto p-4 w-full border border-gray-300 rounded" rows={4} placeholder="Updated the email copy"/>
        </div>
        <div className="text-center">
          <button type="button" onClick={saveCommitMessage} className="publish-button block h-16 w-72 mx-auto mt-4 px-4 py-2 border border-transparent text-2xl leading-6 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:border-blue-700 active:bg-blue-700 transition ease-in-out duration-150">
            Publish with message
          </button>
          <button disabled type="button" className="publish-button-loading hidden h-16 w-48 mt-4 block mx-auto px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 transition ease-in-out duration-150 cursor-not-allowed">
            <svg className="animate-spin h-7 w-7 m-auto text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </button>
          <button type="button" className="skip-button text-sm leading-5 text-blue-600 bg-transparent cursor-pointer mt-2 hover:underline" onClick={skipCommitMessage}>Skip message and publish</button>
        </div>
      </div>
    </div>
  );
};

const simulateClick = async (): Promise<void> => {
  await delay(50);
  select('input[aria-label="On off switch"]')?.click();
  select('input[aria-label="On off switch"]')?.click();
};

const saveCommitMessage = async (): Promise<void> => {
  try {
    disableButtons();
    // @ts-expect-error
    const message = select('#commit-message')?.value;
    await formatZapDescription(message as string);
    void simulateClick();
  } finally {
    enableButtons();
    hideModal();
  }
};

const skipCommitMessage = async (): Promise<void> => {
  try {
    disableButtons();
    await formatZapDescription('No message');
    void simulateClick();
  } finally {
    enableButtons();
    hideModal();
  }
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
  modal!.classList.remove('hidden');

  const body = select('body');
  body!.style.overflow = 'hidden';
};

const hideModal = (): void => {
  const modal = select('.commit-message-modal');
  modal!.classList.add('hidden');

  const body = select('body');
  body!.style.overflow = 'auto';
};

const disableButtons = (): void => {
  const publishButton = select('button.publish-button');
  publishButton!.classList.add('hidden');
  const publishButtonLoading = select('button.publish-button-loading');
  publishButtonLoading!.classList.remove('hidden');

  const skipButton = select('button.skip-button');
  skipButton!.disabled = true;
};

const enableButtons = (): void => {
  const publishButton = select('button.publish-button');
  publishButton!.classList.remove('hidden');
  const publishButtonLoading = select('button.publish-button-loading');
  publishButtonLoading!.classList.add('hidden');

  const skipButton = select('button.skip-button');
  skipButton!.disabled = false;
};

const handleZapActivated = async (event: delegate.Event<MouseEvent>): Promise<void> => {
  const commitMessageSaved = select('body.commit-message-saved');
  if (isZapNameSet() && !commitMessageSaved) {
    showModal();
    event.stopPropagation();
  }
};

async function init(): Promise<false | void> {
  await elementReady('.flow-container__app-bar', {
    stopOnDomReady: false
  });

  renderModal();
  onTurnZapOnToggleSwitchEnabled(handleZapActivated);
}

void features.add(__filebasename, {
  include: [
    isZapEditor
  ],
  init
});
