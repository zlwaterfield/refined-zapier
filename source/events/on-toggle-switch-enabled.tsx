import delegate from 'delegate-it';

type DelegateFieldEvent = delegate.EventHandler<MouseEvent, HTMLInputElement>;

function onToggleSwitchEnabled(selector: string, callback: DelegateFieldEvent): void {
	delegate<HTMLInputElement, 'click'>(document, selector, 'click', event => {
		const target = event.delegateTarget;
		if (target instanceof HTMLInputElement) {
			const input = target;
			if (input.type === 'checkbox' && isCurrentlyUnchecked(input)) {
				callback(event);
			}
		}
	});
}

function isCurrentlyUnchecked(element: HTMLInputElement): boolean {
	return !!element?.nextElementSibling?.className.includes('unchecked');
}

export function onTurnZapOnToggleSwitchEnabled(callback: DelegateFieldEvent): void {
	onToggleSwitchEnabled('input[class*=ToggleSwitch__input]', callback);
}
