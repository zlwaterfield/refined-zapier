export const is404 = (): boolean => document.title === '404: Not Found';

export const isDashboard = (url: URL | HTMLAnchorElement | Location = location): boolean => url.pathname === '/app/dashboard';

export const isZaps = (url: URL | HTMLAnchorElement | Location = location): boolean => url.pathname === '/app/zaps' || /\/app\/zaps\/folder\/[0-9]{0,9}/.test(url.pathname);

export const isMyZaps = (url: URL | HTMLAnchorElement | Location = location): boolean => url.pathname === '/app/connections' || /\/app\/zaps\/folder\/[0-9]{0,9}/.test(url.pathname);

export const isZapHistory = (url: URL | HTMLAnchorElement | Location = location): boolean => url.pathname === '/app/history/usage';

export const isZapDetails = (url: URL | HTMLAnchorElement | Location = location): boolean => /\/app\/zap\/[0-9]{0,9}/.test(url.pathname);

export const isZapEditor = (url: URL | HTMLAnchorElement | Location = location): boolean => /\/app\/editor\/[0-9]{0,9}/.test(url.pathname);
