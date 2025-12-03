import { Emitter } from '@renderer/Emitter';
import { MENU_EVENTS } from '@renderer/events/MenuEvents';
import { Global } from '@renderer/Global';
import { getLocale } from '@renderer/locale';

import { ShowFolderNotification } from './MenuUtils';

/**
 * @type {import('@renderer/types/menu.types').BaseMenu}
 */
export function AlignToolMenu({ config, page }) {
	const locale = getLocale();

	const f = page.addFolder({
		title: locale['tools.align_title'],
		expanded: false
	});

	const folderNotification = ShowFolderNotification(f);

	const init = () => {
		const reset = () => {
			const defaultValues = Global.defaultMenuWindowAlignment();
			Global.set_menu_window_alignment(defaultValues);
			config.updateAlignment();

			Emitter.emit(MENU_EVENTS.REQUEST_DELETE_ALIGNMENT);
			folderNotification.show(locale['info.reset_applied']);
		};

		const save = () => {
			Emitter.emit(MENU_EVENTS.REQUEST_SAVE_ALIGNMENT);
			folderNotification.show(locale['info.settings_saved'], 'warn');
		};

		/**
		 * @see https://github.com/tweakpane/plugin-essentials
		 */
		f.addBlade({
			view: 'buttongrid',
			size: [3, 1],
			cells: (x, y) => ({
				title: [
					[locale['info.left'], locale['info.right'], locale['info.top_center']],
				][y][x],
			}),
			label: locale['info.align'],
		}).on('click', (ev) => {
			// console.log(ev);
			const id = ev.index.toString();

			switch (id) {
			case '0,0':
				config.alignLeft();
				break;
			case '1,0':
				config.alignRight();
				break;
			case '2,0':
				config.alignTopMiddle();
				break;
			}
		});

		/**
		 * @see https://github.com/tweakpane/plugin-essentials
		 */
		f.addBlade({
			view: 'buttongrid',
			size: [2, 1],
			cells: (x, y) => ({
				title: [
					[locale['btn.reset'], locale['btn.save']],
				][y][x],
			}),
			label: locale['info.actions'],
		}).on('click', (ev) => {
			// console.log(ev);
			const id = ev.index.toString();

			switch (id) {
			case '0,0':
				reset();
				break;
			case '1,0':
				save();
				break;
			}
		});

		config.updateAlignment();
	};

	Emitter.emit(MENU_EVENTS.REQUEST_LOAD_ALIGNMENT);
	Emitter.on(MENU_EVENTS.REQUEST_LOAD_ALIGNMENT_COMPLETE, init);
}
