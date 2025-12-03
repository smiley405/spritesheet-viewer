import { Emitter } from '@renderer/Emitter';
import { MENU_EVENTS } from '@renderer/events/MenuEvents';
import { getLocale } from '@renderer/locale';

/**
 * @type {import('@renderer/types/menu.types').BaseMenu}
 */
export function LoadMenu({ pane, page }) {
	const locale = getLocale();
	const self = {
		open: () => {
			Emitter.emit(MENU_EVENTS.LOAD);
			pane.expanded = false;
		},
	};

	page.addButton({
		title: locale['menu.load']
	}).on('click', self.open);
}
