import delegate from 'delegate-it';

type DelegateFieldEvent = delegate.EventHandler<MouseEvent, HTMLDivElement>;

function onDivHover(selector: string, callback: DelegateFieldEvent): void {
  delegate<HTMLDivElement, 'mouseout'>(document.body, selector, 'mouseout', event => {
    callback(event);
  });
  delegate<HTMLDivElement, 'mouseover'>(document.body, selector, 'mouseover', event => {
    callback(event);
  });
}

export function onDashboardZapIconsHover(callback: DelegateFieldEvent): void {
  onDivHover('.zap-icons', callback);
}

export function onDashboardZapTitleHover(callback: DelegateFieldEvent): void {
  onDivHover('.dashboard-zap__title', callback);
}
