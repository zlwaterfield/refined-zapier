import delegate from 'delegate-it';

type DelegateFieldEvent = delegate.EventHandler<KeyboardEvent, HTMLTextAreaElement>;

function onFieldKeydown(selector: string, callback: DelegateFieldEvent): void {
	delegate<HTMLTextAreaElement, 'keyup'>(document, selector, 'keyup', event => {
		callback(event);
	});
}

export function onFolderSearchChange(callback: DelegateFieldEvent): void {
	onFieldKeydown('input[aria-label="Filter Folders…"]', callback);
}
