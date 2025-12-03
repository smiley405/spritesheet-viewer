import { Emitter } from '@renderer/Emitter';
import { CLEAR_EVENTS } from '@renderer/events/ClearEvents';
import { Global } from '@renderer/Global';
import { getLocale } from '@renderer/locale';
import { WarningPopup } from '@renderer/popup/WarningPopup';

import { EditMode, ShowFolderNotification } from './MenuUtils';

/**
 * @type {import('@renderer/types/menu.types').BaseMenu}
 */
export function ClearMenu({ pane, page }) {
	const state = Global.state;
	const locale = getLocale();

	const f = page.addFolder({
		title: locale['clear.title'],
		expanded: false
	});

	const editMode = EditMode(f, f.title);
	const folderNotification = ShowFolderNotification(f);

	const viewportInput = f.addBinding(state.clear, 'viewport', {
		label: locale['clear.viewport']
	}).on('change', ()=> editMode.show());
	const framesInput = f.addBinding(state.clear, 'frames', {
		label: locale['clear.frames']
	}).on('change', ()=> editMode.show());

	const self = {
		ok: () => {
			const allowClearance = Boolean([
				state.clear.viewport,
				state.clear.frames
			].filter(val => val).length);

			if (allowClearance) {
				if (!state.image.src) {
					pane.expanded = false;
					WarningPopup({text: locale['warn.viewport_is_empty']});
				} else {
					if (state.clear.viewport) {
						Global.reset('image');
						Global.reset('preview');
						Global.reset('viewport');
					}

					Emitter.emit(CLEAR_EVENTS.CLEAR);
					folderNotification.show();
				}
			} else {
				folderNotification.show(locale['info.nothing_to_clear'], 'warn');
			}

			editMode.hide();
		},
	};

	f.addButton({
		title: locale['btn.confirm']
	}).on('click', self.ok);
}
