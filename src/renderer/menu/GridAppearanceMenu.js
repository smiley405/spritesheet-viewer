import { Emitter } from '@renderer/Emitter';
import { GRID_EVENTS } from '@renderer/events/GridEvents';
import { Global } from '@renderer/Global';
import { getLocale } from '@renderer/locale';
import { truncateDecimals } from '@renderer/utils';

import { EditMode, ShowFolderNotification } from './MenuUtils';

/**
 * @type {import('@renderer/types/menu.types').BaseMenu}
 */
export function GridAppearanceMenu({ page }) {
	const state = Global.state;
	const locale = getLocale();

	const f = page.addFolder({
		title: locale['grid_appearance.title'],
		expanded: false
	});

	const folderNotification = ShowFolderNotification(f);
	const editMode = EditMode(f, f.title);

	const init = () => {
		const showInput = f.addBinding(state.grid.appearance, 'visible', {
			label: locale['grid_appearance.visible']
		}).on('change', ()=> editMode.show());
		const colorInput = f.addBinding(state.grid.appearance, 'color', {
			label: locale['grid_appearance.color']
		}).on('change', ()=> editMode.show());
		const opacityInput = f.addBinding(state.grid.appearance, 'opacity', {
			label: locale['grid_appearance.opacity'],
			min: 0,
			max: 1,
			step:0.1
		}).on('change', (data)=> {
			state.grid.appearance.opacity = truncateDecimals(data.value, 1);
			editMode.show();
		});
		const lineThicknessInput = f.addBinding(state.grid.appearance, 'lineThickness', {
			label: locale['grid_appearance.line_thickness'],
			min: 0.1,
			max: 1,
			step: 0.1
		}).on('change', (data)=> {
			state.grid.appearance.lineThickness = truncateDecimals(data.value, 1);
			editMode.show();
		});

		function refreshInputs() {
			showInput.refresh();
			colorInput.refresh();
			opacityInput.refresh();
			lineThicknessInput.refresh();
		}

		const self = {
			reset: () => {
				Global.set_grid_appearance(Global.defaultGridAppearance());
				refreshInputs();
				self.ok();
				editMode.hide();
				Emitter.emit(GRID_EVENTS.REQUEST_DELETE_APPEARANCE);
				folderNotification.show(locale['info.reset_applied']);
			},
			ok: () => {
				Emitter.emit(GRID_EVENTS.UPDATE_SETTINGS);
				editMode.hide();
				folderNotification.show();
				editMode.hide();
			},
			save: () => {
				self.ok();
				Emitter.emit(GRID_EVENTS.REQUEST_SAVE_APPEARANCE);
				folderNotification.show(locale['info.settings_saved'], 'warn');
			},
		};

		/**
		 * @see https://github.com/tweakpane/plugin-essentials
		 */
		f.addBlade({
			view: 'buttongrid',
			size: [3, 1],
			cells: (x, y) => ({
				title: [
					[locale['btn.reset'], locale['btn.apply'], locale['btn.save']],
				][y][x],
			}),
			label: locale['info.actions'],
		}).on('click', (ev) => {
			// console.log(ev);
			const id = ev.index.toString();

			switch (id) {
			case '0,0':
				self.reset();
				break;
			case '1,0':
				self.ok();
				break;
			case '2,0':
				self.save();
				break;
			}
		});
	};

	Emitter.emit(GRID_EVENTS.REQUEST_LOAD_APPEARANCE);
	Emitter.on(GRID_EVENTS.REQUEST_LOAD_APPEARANCE_COMPLETE, init);
}
