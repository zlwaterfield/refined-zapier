import delegate from 'delegate-it'

type DelegateFieldEvent = delegate.EventHandler<MouseEvent, HTMLDivElement>;

function onDivHover(selector: string, callback: DelegateFieldEvent): void {
    delegate<HTMLDivElement, 'mouseout'>(document.body, selector, 'mouseout', event => {
        callback(event);
    });
    delegate<HTMLDivElement, 'mouseover'>(document.body, selector, 'mouseover', event => {
        callback(event);
    });
}

export function onDashboardZapHover(callback: DelegateFieldEvent): void {
	onDivHover('.zap-mini.dashboard', callback);
}