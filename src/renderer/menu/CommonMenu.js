import { getLocale } from '@renderer/locale';
import {TabPageApi} from 'tweakpane';

/**
 * @param {{pages: TabPageApi[]}} props
 * @returns {void}
 */
export function CommonMenu({ pages }) {
	const locale = getLocale();

	/**
	 * @param {TabPageApi} page
	 * @returns {void}
	 */
	const closeFolders = (page) => {
		page.children.forEach(child => {
			if (child['expanded']) {
				child['expanded'] = false;
			}
		});
	};

	pages.forEach(page => {
		page.addButton({
			title: locale['tools.close_opened_folders']
		}).on('click', () => {
			closeFolders(page);
		});
		page.addBlade({
			view: 'separator',
		});
	});
}

