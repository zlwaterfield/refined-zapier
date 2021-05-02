import delegate from 'delegate-it';

type DelegateFieldEvent = delegate.EventHandler<MouseEvent, HTMLElement>;

function onElementClicked(selector: string, callback: DelegateFieldEvent): void {
	delegate<HTMLElement, 'click'>(document, selector, 'click', event => {
		callback(event);
	});
}

export function onMainWrapperClick(callback: DelegateFieldEvent): void {
	onElementClicked('main[class*="App--mainStyle"]', callback);
}
