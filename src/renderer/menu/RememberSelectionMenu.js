import { Global } from '@renderer/Global';
import { getLocale } from '@renderer/locale';

import { EditMode, ShowFolderNotification } from './MenuUtils';

/**
 * @type {import('@renderer/types/menu.types').BaseMenu}
 */
export function RememberSelectionMenu({ page }) {
	const state = Global.state;
	const locale = getLocale();

	const f = page.addFolder({
		title: locale['remember.title'],
		expanded: false
	});

	const editMode = EditMode(f, f.title);
	const folderNotification = ShowFolderNotification(f);

	const gridInput = f.addBinding(state.remember, 'grid', {
		label: locale['remember.grid']
	}).on('change', ()=> editMode.show());
	const viewportInput = f.addBinding(state.remember, 'viewport', {
		label: locale['remember.viewport']
	}).on('change', ()=> editMode.show());
	const previewInput = f.addBinding(state.remember, 'preview', {
		label: locale['remember.preview']
	}).on('change', ()=> editMode.show());
	const framesInput = f.addBinding(state.remember, 'frames', {
		label: locale['remember.frames']
	}).on('change', ()=> editMode.show());
	const sameFileNameOnlyInput = f.addBinding(state.remember, 'sameFileNameOnly', {
		label: locale['remember.sameFileName']
	}).on('change', ()=> editMode.show());


	const refreshInputs = () => {
		gridInput.refresh();
		viewportInput.refresh();
		previewInput.refresh();
		framesInput.refresh();
		sameFileNameOnlyInput.refresh();
	};

	const self = {
		reset: () => {
			const defaultValues = Global.defaultRemember();
			for (let key in defaultValues) {
				state.remember[key] = defaultValues[key];
			}
			refreshInputs();
			self.ok();
			folderNotification.show(locale['info.reset_applied']);
		},
		ok: () => {
			folderNotification.show();
			editMode.hide();
		},
	};

	// f.addButton({
	// 	title: locale['btn.reset']
	// }).on('click', self.reset);
	f.addButton({
		title: locale['btn.apply']
	}).on('click', self.ok);
}

