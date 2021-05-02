import React from 'dom-chef';
import elementReady from 'element-ready';

import features from '.';

async function init(): Promise<void> {
  await elementReady('body', {
    stopOnDomReady: false
  });

  document.head.append(<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600&display=swap" rel="stylesheet" />);
}

void features.add(__filebasename, {
  init
});
