import delegate from 'delegate-it'

type DelegateFieldEvent = delegate.EventHandler<MouseEvent, HTMLButtonElement>

function onButtonClicked(selector: string, callback: DelegateFieldEvent): void {
    delegate<HTMLButtonElement, 'click'>(document, selector, 'click', event => {
        callback(event);
    });
}

export function onTurnZapOnButtonClicked(callback: DelegateFieldEvent): void {
	onButtonClicked('#test-sample', callback);
}