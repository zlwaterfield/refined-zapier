import marked from 'marked';

import './improved-zap-list-styling.css';
import select from 'select-dom';
import delay from 'delay';
import elementReady from 'element-ready';
import sanitizeHtml from 'sanitize-html';

import features from '.';
import {isZapDetails} from '../helpers/page-detect';
import {fetchZapDetails} from '../helpers/api';
import {onMainWrapperClick} from '../events/on-element-clicked';

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

const formatDescription = async (): Promise<void> => {
  console.log('formatDescription');

  const zapId = location.pathname.slice(9, location.pathname.length);
  const zapDetails = await fetchZapDetails(zapId);
  const existingDescription = zapDetails.description;
  if (!existingDescription) {
    return;
  }

  const sanitizedExistingDescription = sanitizeHtml(existingDescription);
  const sanitizedExistingDescriptionWithNewLines = sanitizedExistingDescription.replace(/\r\n|\r|\n|\\n/g, '<br>');
  const markdownDescription = marked(sanitizedExistingDescriptionWithNewLines);

  const descriptionElement = findDescriptionElement();
  const descriptionParagraph = descriptionElement?.nextSibling;
  if (!descriptionParagraph || descriptionParagraph.nodeName !== 'P') {
    return;
  }

  // @ts-expect-error
  descriptionParagraph.innerHTML = markdownDescription;
};

async function init(): Promise<false | void> {
  await elementReady('div[class*="DetailItem--rootStyle"]', {
    stopOnDomReady: false
  });

  onMainWrapperClick(async () => {
    await delay(50); // Add a delay to confirm the change happened
    void formatDescription();
  });

  void formatDescription();
}

void features.add(__filebasename, {
  include: [
    isZapDetails
  ],
  init
});
