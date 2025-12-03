import { Emitter } from '@renderer/Emitter';
import { MENU_EVENTS } from '@renderer/events/MenuEvents';
import { getLocale } from '@renderer/locale';

/**
 * @type {import('@renderer/types/menu.types').BaseMenu}
 */
export function HelpMenu({ pane, page }) {
	const locale = getLocale();

	const self = {
		open: () => {
			Emitter.emit(MENU_EVENTS.HELP);
			pane.expanded = false;
		},
	};

	page.addButton({
		title: locale['menu.help']
	}).on('click', self.open);
}
