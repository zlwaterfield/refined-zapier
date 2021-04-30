import delegate from 'delegate-it'

type DelegateFieldEvent = delegate.EventHandler<MouseEvent, HTMLInputElement>

function onTooltipEnabled(selector: string, callback: DelegateFieldEvent): void {
    delegate<HTMLInputElement, 'click'>(document, selector, 'click', event => {
        const target = event.delegateTarget;
        if (target instanceof HTMLInputElement) {
            var input = target as HTMLInputElement;
            if (input.type === "checkbox" && isCurrentlyUnchecked(input)) {
                callback(event);
            }
        }
    });
}

function isCurrentlyUnchecked(element: HTMLInputElement): boolean {
    return element.nextElementSibling !== null && 
        element.nextElementSibling.className.includes('unchecked');
}

export function onTurnZapOnTooltipEnabled(callback: DelegateFieldEvent): void {
	onTooltipEnabled('.css-1jfssyj-ToggleSwitch__input', callback);
}