import React from 'dom-chef';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import select from 'select-dom';

import features from '.';
import './show-zap-details-on-hover.css';
import {isZaps} from '../helpers/page-detect';
import {onDashboardZapIconsHover, onDashboardZapTitleHover} from '../events/on-div-hover';
import {fetchZapDetails} from '../helpers/api';
import {DESCRIPTION_SPLIT_MESSAGE} from './commit-messages';

async function handleZapIconsHover(event: delegate.Event<MouseEvent>): Promise<void> {
  const zapIconsDiv = event.delegateTarget;
  const zapIconsDivWrapper = zapIconsDiv.parentElement?.parentElement?.parentElement;
  const zapId = zapIconsDivWrapper!.getAttribute('data-zap-id');
  if (zapId === null) {
    console.log('Unexpected missing zapId');
    return;
  }

  // This is a hack and placed outside the conditional to preserve
  // correct ordering of mouseover and mouseout.
  const overview = await fetchZapDetails(zapId);
  if (event.type === 'mouseover') {
    const existingTooltip = select(`#icon-tooltip-${zapId}`);
    if (existingTooltip) {
      existingTooltip.classList.remove('hide-tooltip');
    } else {
      event.delegateTarget.after(
        <div id={`icon-tooltip-${zapId}`} className="hover-tooltip icon-tooltip absolute px-6 py-4 left-2 top-3/4 bg-white shadow-lg rounded-lg z-10 border-solid border border-gray-300 overflow-hidden h-auto w-auto max-w-xs">
          <h3>All apps used</h3>
          <ul className="list-inside list-disc">
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

async function handleZapTitleHover(event: delegate.Event<MouseEvent>): Promise<void> {
  const zapTitleDiv = event.delegateTarget;
  const zapTitleDivWrapper = zapTitleDiv.parentElement?.parentElement;
  const zapId = zapTitleDivWrapper!.getAttribute('data-zap-id');
  if (zapId === null) {
    console.log('Unexpected missing zapId');
    return;
  }

  // This is a hack and placed outside the conditional to preserve
  // correct ordering of mouseover and mouseout.
  const overview = await fetchZapDetails(zapId);
  const description = getDescriptionForDisplay(overview.description);
  if (event.type === 'mouseover') {
    const existingTooltip = select(`#title-tooltip-${zapId}`);
    if (existingTooltip) {
      existingTooltip.classList.remove('hide-tooltip');
    } else {
      event.delegateTarget.after(
        <div id={`title-tooltip-${zapId}`} className="hover-tooltip title-tooltip absolute px-6 py-4 left-64 top-3/4 bg-white shadow-lg rounded-lg z-10 border-solid border border-gray-300 overflow-hidden h-auto w-auto max-w-sm">
          <h3>Description</h3>
          <p>{description}</p>
        </div>
      );
    }
  } else if (event.type === 'mouseout') {
    select(`#title-tooltip-${zapId}`)?.classList.add('hide-tooltip');
  }
}

function getDescriptionForDisplay(description: string): string {
  if (description === null || description.length === 0) {
    return 'None';
  }

  const prefixIndex = description.indexOf(DESCRIPTION_SPLIT_MESSAGE);
  description = prefixIndex > 0 ? description.substr(0, prefixIndex) : description;
  return description.length > 0 ? description : 'None';
}

async function cacheTooltips(): Promise<void> {
  await elementReady('.zap-mini', {stopOnDomReady: false});

  const zapIds = select.all('.zap-mini').map(element => element.getAttribute('data-zap-id'));
  // Fire API requests to load the necessary data.
  // These are memoized in session so loads on hover are fast.
  zapIds.filter(zapId => zapId !== null).map(async zapId => fetchZapDetails(zapId!));
}

async function init(): Promise<false | void> {
  onDashboardZapIconsHover(handleZapIconsHover);
  onDashboardZapTitleHover(handleZapTitleHover);

  void cacheTooltips();
}

void features.add(__filebasename, {
  include: [
    isZaps
  ],
  init
});
