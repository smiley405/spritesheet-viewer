import { Emitter } from '@renderer/Emitter';
import { PREVIEW_EVENTS } from '@renderer/events/PreviewEvents';
import { Global } from '@renderer/Global';
import { getLocale } from '@renderer/locale';

import { ShowFolderNotification } from './MenuUtils';

/**
 * @type {import('@renderer/types/menu.types').BaseMenuReturnsUpdate}
 */
export function PreviewMenu({ page }) {
	const state = Global.state;
	const locale = getLocale();

	const f = page.addFolder({
		title: locale['preview.title'],
		expanded: false
	});

	const folderNotification = ShowFolderNotification(f);

	const self = {
		update: null
	};

	const init = () => {
		const pz = f.addBinding(state.preview, 'zoom', {
			label: locale['preview.zoom'],
			min: 0,
			// step: 0.1
		}).on('change', e => {
			Emitter.emit(PREVIEW_EVENTS.UPDATE_ZOOM, e.value);
		});

		const px = f.addBinding(state.preview.pan, 'x', {
			label: locale['preview.x']
			// step: 0.1,
		}).on('change', e => {
			Emitter.emit(PREVIEW_EVENTS.UPDATE_PAN, {x: e.value});
		});

		const py = f.addBinding(state.preview.pan, 'y', {
			label: locale['preview.y']
			// step: 0.1,
		}).on('change', e => {
			Emitter.emit(PREVIEW_EVENTS.UPDATE_PAN, {y: e.value});
		});

		const refreshInputs = () => {
			pz.refresh();
			px.refresh();
			py.refresh();
		};

		const reset = () => {
			const defaultValues = Global.defaultPreview();
			Global.set_preview({
				pan: defaultValues.pan,
				zoom: defaultValues.zoom
			});

			Emitter.emit(PREVIEW_EVENTS.REQUEST_DELETE);
			refreshInputs();
			folderNotification.show(locale['info.reset_applied']);
		};

		const save = () => {
			Emitter.emit(PREVIEW_EVENTS.REQUEST_SAVE);
			folderNotification.show(locale['info.settings_saved'], 'warn');
		};

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

		self.update = () => {
			pz.controller.value.setRawValue(state.preview.zoom, {forceEmit: false, last: true});
			px.controller.value.setRawValue(state.preview.pan.x, {forceEmit: false, last: true});
			py.controller.value.setRawValue(state.preview.pan.y, {forceEmit: false, last: true});
		};

	};

	Emitter.emit(PREVIEW_EVENTS.REQUEST_LOAD);
	Emitter.on(PREVIEW_EVENTS.REQUEST_LOAD_COMPLETE, init);

	return self;
}
