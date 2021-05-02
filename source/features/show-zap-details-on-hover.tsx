import React from 'dom-chef';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import select from 'select-dom';

import features from '.';
import './show-zap-details-on-hover.css';
import {isZaps} from '../helpers/page-detect';
import {onDashboardZapIconsHover, onDashboardZapTitleHover} from '../events/on-div-hover';
import { fetchZapDetails } from '../helpers/api';

async function handleZapIconsHover(event: delegate.Event<MouseEvent>): Promise<void> {
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
          <h3>All apps used</h3>
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
