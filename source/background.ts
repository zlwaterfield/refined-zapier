import 'webext-dynamic-content-scripts';
import cache from 'webext-storage-cache'; // Also needed to regularly clear the cache
import './options-storage';

const messageHandlers = {
	openUrls(urls: string[], {tab}: browser.runtime.MessageSender) {
		for (const [i, url] of urls.entries()) {
			void browser.tabs.create({
				url,
				index: tab!.index + i + 1,
				active: false
			});
		}
	},
	closeTab(_: any, {tab}: browser.runtime.MessageSender) {
		void browser.tabs.remove(tab!.id!);
	},
	async fetch(url: string) {
		const response = await fetch(url);
		return response.text();
	},
	async fetchJSON(url: string) {
		const response = await fetch(url);
		return response.json();
	}
};

browser.runtime.onMessage.addListener((message, sender) => {
	for (const id of Object.keys(message ?? {}) as Array<keyof typeof messageHandlers>) {
		if (id in messageHandlers) {
			return messageHandlers[id](message[id], sender);
		}
	}
});

browser.runtime.onInstalled.addListener(async ({reason}) => {
	// Only notify on install
	if (reason === 'install') {
		const {installType} = await browser.management.getSelf();
		if (installType === 'development') {
			return;
		}

    // @TODO - make a welcome page
		await browser.tabs.create({
			url: 'https://github.com/sindresorhus/refined-github/issues/3543'
		});
	}

	// Hope that the feature was fixed in this version
	await cache.delete('hotfix');
});
