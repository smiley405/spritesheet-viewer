import { Emitter } from '@renderer/Emitter';
import { MENU_EVENTS } from '@renderer/events/MenuEvents';
import { getLocale } from '@renderer/locale';

/**
 * @type {import('@renderer/types/menu.types').BaseMenu}
 */
export function DebugMenu({ page }) {
	const locale = getLocale();

	const f = page;

	f.addButton({
		title: locale['tools.toggle_debug_menu']
	}).on('click', ()=> {
		Emitter.emit(MENU_EVENTS.TOGGLE_APP_MENUBAR);
	});
}
