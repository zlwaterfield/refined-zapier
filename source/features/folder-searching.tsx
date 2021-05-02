import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import delegate from 'delegate-it';

import features from '.';
import './folder-searching.css';
import {isZaps} from '../helpers/page-detect';
import {onFolderSearchChange} from '../events/on-input-change';

const filterFolders = (search: string): void => {
	const _filterFolders = (folderWrapper?: HTMLElement): void => {
		if (!folderWrapper) {
			return;
		}

		const listParent = select('ul', folderWrapper);
		const folders = select.all('li', listParent);
		for (const element of folders) {
			const innerElement = select('.truncated-text', element);
			const folderMatch = innerElement!.textContent?.toLowerCase().includes(search.toLowerCase());
			if (folderMatch) {
				element.classList.remove('hide-folder-from-search');
			} else {
				element.classList.add('hide-folder-from-search');
			}
		}
	};

	const privateFolder = select('section[data-testid="folders:private"]');
	_filterFolders(privateFolder);
	const sharedFolder = select('section[data-testid="folders:shared"]');
	_filterFolders(sharedFolder);
};

async function init(): Promise<false | void> {
	await elementReady('input[aria-label="Filter Zaps…"]', {
		stopOnDomReady: false
	});

  const handleInputChange = (event: delegate.Event<KeyboardEvent>): void => {
		// @ts-expect-error
		const {value} = event.delegateTarget;
		filterFolders(value as string);
	};

	onFolderSearchChange(handleInputChange);

	const filterZapsInputWrapper = select('.search-box');
  filterZapsInputWrapper?.classList.add('zap-search');
	filterZapsInputWrapper!.after(
		<div className="search-box folder-search">
			<span className="search-box__icon search-box__icon--before">
				<span className="svg-icon svg-icon--search search-box__search-icon">
					<svg viewBox="0 0 512 512">
						<path d="M435 219c0-110-89-199-199-199S37 109 37 219s89 199 199 199 199-89 199-199zM236 333c-63 0-114-51-114-114s51-114 114-114 114 51 114 114-51 114-114 114zm142 115c14 15 42 44 42 44 16 16 43 17 60 1 17-17 18-44 1-61l-95-99c-16-17-43-17-60-1-17 17-18 44-1 61 0 0 35 37 53 55z"/>
					</svg>
				</span>
			</span>
			<input
				type="text"
				placeholder="Filter Folders…"
				className="text-input search-box__input folder-search-input"
				aria-label="Filter Folders…"
			/>
		</div>
	);
	filterZapsInputWrapper?.parentElement?.classList.add('zap-listings-with-folder-search');
}

void features.add(__filebasename, {
	include: [
		isZaps
	],
	init
});
