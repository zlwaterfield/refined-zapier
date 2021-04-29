import './improved-sidebar-icons.css';
import select from 'select-dom';
import elementReady from 'element-ready';

import features from '.';

async function init(): Promise<false | void> {
	await elementReady('[class*=UniversalSidebar__content]', {
		waitForChildren: false,
		stopOnDomReady: false
	});

	const UniversalSidebarContent = select('[class*=UniversalSidebar__content]');
	select.all('[class*=-Icon--]', UniversalSidebarContent).forEach(element => {
		element.classList.add('red-icon');
	});
}

void features.add(__filebasename, {
	init
});
