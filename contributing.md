# Contributing

Suggestions and pull requests are highly encouraged! Have a look at the [open issues](https://github.com/zlwaterfield/refined-zapier/issues).

## Notions

- You will need to be familiar with [npm](https://docs.npmjs.com/getting-started/) and TypeScript to build this extension.
- The extension can be loaded into Chrome or Firefox manually ([See notes below](#loading-into-the-browser))
- [JSX](https://reactjs.org/docs/introducing-jsx.html) is used to create DOM elements.
- All the [latest DOM APIs](https://github.com/WebReflection/dom4#features) and JavaScript features are available because the extension only has to work in the latest Chrome and Firefox. 🎉
- Each JavaScript feature lives in its own file under [`source/features`](https://github.com/sindresorhus/refined-github/tree/main/source/features) and it's imported in [`source/refined-zapier.ts`](https://github.com/zlwaterfield/refined-zapier/blob/main/source/refined-zapier.ts).
- See what a feature [looks like]https://github.com/zlwaterfield/refined-zapier/blob/main/source/features/improved-zap-list-styling.tsx).


## `features.add`

The simplest usage of `feature.add` is the following. This will be run instantly on all page-loads:

```js
import * as pageDetect from 'github-url-detection';
import features from '.';

function init() {
  console.log('✨');
}

void features.add(__filebasename, {
  include: [
    isZaps
  ],
  awaitDomReady: false,
  init
});
```

## Requirements

[Node.js](https://nodejs.org/en/download/) version 15 or later is required.

## Workflow

First clone:

```sh
git clone https://github.com/zlwaterfield/refined-zapier
cd refined-zapier
yarn install
```

When working on the extension or checking out branches, use this to have it constantly build your changes:

```sh
yarn watch # Listen to file changes and automatically rebuild
```

Then load or reload it into the browser to see the changes.

## Loading into the browser

Once built, load it in the browser of your choice with [web-ext](https://github.com/mozilla/web-ext):

```sh
npx web-ext run --target=chromium # Open extension in Chrome
```

```sh
npx web-ext run # Open extension in Firefox
```

Or you can [load it manually in Chrome](https://www.smashingmagazine.com/2017/04/browser-extension-edge-chrome-firefox-opera-brave-vivaldi/#google-chrome-opera-vivaldi) or [Firefox](https://www.smashingmagazine.com/2017/04/browser-extension-edge-chrome-firefox-opera-brave-vivaldi/#mozilla-firefox).
