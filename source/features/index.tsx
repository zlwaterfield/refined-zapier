import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import domLoaded from 'dom-loaded';
import stripIndent from 'strip-indent';
import {Promisable} from 'type-fest';
import elementReady from 'element-ready';

import optionsStorage, {RZPOptions} from '../options-storage';

type BooleanFunction = () => boolean;
type CallerFunction = (callback: VoidFunction) => void;
type FeatureInit = () => Promisable<false | void>;

interface FeatureLoader extends Partial<InternalRunConfig> {
  /** This only adds the shortcut to the help screen, it doesn't enable it. @default {} */
  shortcuts?: Record<string, string>;

  /** Whether to wait for DOM ready before running `init`. `false` makes `init` run right as soon as `body` is found. @default true */
  awaitDomReady?: false;

  /** When pressing the back button, DOM changes and listeners are still there, so normally `init` isn’t called again thanks to an automatic duplicate detection.
  This detection however might cause problems or not work correctly in some cases #3945, so it can be disabled with `false` or by passing a custom selector to use as duplication check
  @default true */
  deduplicate?: false | string;

  /** When true, don’t run the `init` on page load but only add the `additionalListeners`. @default false */
  onlyAdditionalListeners?: true;

  init: FeatureInit; // Repeated here because this interface is Partial<>
}

interface InternalRunConfig {
  include: BooleanFunction[];
  exclude: BooleanFunction[];
  init: FeatureInit;
  deinit?: VoidFunction | VoidFunction[];
  additionalListeners: CallerFunction[];

  onlyAdditionalListeners: boolean;
}

let log: typeof console.log;
const {version} = browser.runtime.getManifest();

let logError = (id: FeatureID, error: unknown): void => {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('token')) {
    console.log(`ℹ️ ${id} →`, message);
    return;
  }

  console.group('Search issue');
  console.log(`https://github.com/zlwaterfield/refined-zapier/issues?q=is%3Aissue+${encodeURIComponent(message)}`);
  console.groupEnd();

  const newIssueUrl = new URL('https://github.com/zlwaterfield/refined-zapier/issues/new?labels=bug&template=1_bug_report.md');
  newIssueUrl.searchParams.set('title', `\`${id}\`: ${message}`);
  newIssueUrl.searchParams.set('body', stripIndent(`
    <!-- Please also include a screenshot if the issue is visible -->

    URL: ${location.href}

    \`\`\`
    ${error instanceof Error ? error.stack! : error as string}
    \`\`\`
  `));
  console.group('Open an issue');
  console.log(newIssueUrl.href);
  console.groupEnd();

  console.groupEnd();
};

// eslint-disable-next-line no-async-promise-executor -- Rule assumes we don't want to leave it pending
const globalReady: Promise<RZPOptions> = new Promise(async resolve => {
  await elementReady('body', { waitForChildren: false });

  if (select.exists('html.refined-zapier')) {
    console.warn(stripIndent(`
      Refined Zapier has been loaded twice. This may be because:

      • You loaded the developer version, or
      • The extension just updated

      If you see this at every load, please open an issue mentioning the browser you're using and the URL where this appears.
    `));
    return;
  }

  document.documentElement.classList.add('refined-zapier');

  // Options defaults
  const [options, hotfix] = await Promise.all([
    optionsStorage.getAll(),
    version === '0.0.2' || await cache.get('hotfix') // Ignores the cache when loaded locally
  ]);

  void checkForHotfixes();
  Object.assign(options, hotfix);

  if (options.customCSS.trim().length > 0) {
    document.head.append(<style>{options.customCSS}</style>);
  }

  // Create logging function
  log = options.logging ? console.log : () => {/* No logging */};

  resolve(options);
});

const setupPageLoad = async (id: FeatureID, config: InternalRunConfig): Promise<void> => {
  const {include, exclude, init, deinit, additionalListeners, onlyAdditionalListeners} = config;

  // If every `include` is false and no `exclude` is true, don’t run the feature
  if (include.every(c => !c()) || exclude.some(c => c())) {
    return;
  }

  const runFeature = async (): Promise<void> => {
    try {
      // Features can return `false` when they decide not to run on the current page
      // Also the condition avoids logging the fake feature added for `has-rzp`
      if (await init() !== false && id !== __filebasename) {
        log('✅', id);
      }
    } catch (error: unknown) {
      logError(id, error);
    }

    if (Array.isArray(deinit)) {
      // The `deinit` array can change until `pjax:start`. Do not loop it outside the listener.
      document.addEventListener('pjax:start', () => {
        for (const callback of deinit) {
          callback();
        }

        deinit.length = 0;
      }, {once: true});
    } else if (typeof deinit === 'function') {
      document.addEventListener('pjax:start', deinit, {once: true});
    }
  };

  if (!onlyAdditionalListeners) {
    await runFeature();
  }

  await domLoaded; // Listeners likely need to work on the whole page
  for (const listener of additionalListeners) {
    listener(runFeature);
  }
};

const checkForHotfixes = cache.function(async () => {
  return {};
  // // The explicit endpoint is necessary because it shouldn't change on GHE
  // const request = await fetch('https://api.github.com/repos/zlwaterfield/refined-zapier/contents/hotfix.json?ref=hotfix');
  // const response = await request.json();
  // const hotfixes: AnyObject | false = JSON.parse(atob(response.content));

  // // eslint-disable-next-line @typescript-eslint/prefer-optional-chain -- https://github.com/typescript-eslint/typescript-eslint/issues/1893
  // if (hotfixes && hotfixes.unaffected && compareVersions(hotfixes.unaffected, version) < 1) {
  //   return {};
  // }

  // return hotfixes;
}, {
  maxAge: {hours: 6},
  cacheKey: () => 'hotfix'
});

const shortcutMap = new Map<string, string>();

const defaultPairs = new Map();

function enforceDefaults(
  id: FeatureID,
  include: InternalRunConfig['include'],
  additionalListeners: InternalRunConfig['additionalListeners']
): void {
  for (const [detection, listener] of defaultPairs) {
    if (!include.includes(detection)) {
      continue;
    }

    if (additionalListeners.includes(listener)) {
      console.error(`❌ ${id} → If you use \`${detection.name as string}\` you don’t need to specify \`${listener.name as string}\``);
    } else {
      additionalListeners.push(listener);
    }
  }
}

/** Register a new feature */
const add = async (id: FeatureID, ...loaders: FeatureLoader[]): Promise<void> => {
  /* Feature filtering and running */
  const options = await globalReady;
  // Skip disabled features, unless the "feature" is the fake feature in this file
  if (!options[`feature:${id}`] && id as string !== __filebasename) {
    log('↩️', 'Skipping', id);
    return;
  }

  for (const loader of loaders) {
    // Input defaults and validation
    const {
      shortcuts = {},
      include = [() => true], // Default: every page
      exclude = [], // Default: nothing
      init,
      deinit,
      awaitDomReady = true,
      deduplicate = 'has-rzp',
      onlyAdditionalListeners = false,
      additionalListeners = []
    } = loader;

    // Register feature shortcuts
    for (const [hotkey, description] of Object.entries(shortcuts)) {
      shortcutMap.set(hotkey, description);
    }

    enforceDefaults(id, include, additionalListeners);

    const details = {include, exclude, init, deinit, additionalListeners, onlyAdditionalListeners};
    if (awaitDomReady) {
      (async () => {
        await domLoaded;
        await setupPageLoad(id, details);
      })();
    } else {
      void setupPageLoad(id, details);
    }

    document.addEventListener('pjax:end', () => {
      if (!deduplicate || !select.exists(deduplicate)) {
        void setupPageLoad(id, details);
      }
    });
  }
};

const addCssFeature = async (id: FeatureID, include: BooleanFunction[]): Promise<void> => {
  void add(id, {
    include,
    awaitDomReady: false,
    init: () => {
      document.body.classList.add('rzp-' + id);
    }
  });
};

/*
When navigating back and forth in history, GitHub will preserve the DOM changes;
This means that the old features will still be on the page and don't need to re-run.

This marks each as "processed"
*/
void add(__filebasename, {
  init: async () => {
    // `await` kicks it to the next tick, after the other features have checked for 'has-rzp', so they can run once.
    await Promise.resolve();
    select('#react-root-app')?.append(<has-rzp/>);
  }
});

const features = {
  add,
  addCssFeature,
  error: logError,
  shortcutMap,
  list: __features__,
  meta: __featuresMeta__
};

export default features;
