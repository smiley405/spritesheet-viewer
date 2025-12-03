import { Emitter } from '@renderer/Emitter';
import { CLEAR_EVENTS } from '@renderer/events/ClearEvents';
import { GRID_EVENTS } from '@renderer/events/GridEvents';
import { Global } from '@renderer/Global';
import { getLocale } from '@renderer/locale';
import { WarningPopup } from '@renderer/popup/WarningPopup';
import { getDivElementById } from '@renderer/utils';

import { EditMode, ShowFolderNotification } from './MenuUtils';

/**
 * @type {import('@renderer/types/menu.types').BaseMenu}
 */
export function GridLayoutMenu({ pane, page }) {
	const state = Global.state;
	const locale = getLocale();

	const frames = getDivElementById('frames');
	const title = locale['grid_layout.title'];
	const f = page.addFolder({
		title,
		expanded: false
	});

	const folderNotification = ShowFolderNotification(f);
	const editMode = EditMode(f, title);

	const init = () => {
		const self = {
			set: () => {
				if (!state.image.src) {
					pane.expanded = false;
					WarningPopup({text: locale['warn.viewport_is_empty']});
				} else {
					if (frames.children.length) {
						pane.expanded = false;
						WarningPopup({
							text: locale['warn.will_clear_all_frames'],
							onAccept: onAccept.bind(this),
							onDecline: ()=> {
								// Emitter.emit(GRID_EVENTS.REMOVE);
							}
						});
					} else {
						onAccept();
					}
					editMode.hide();
				}
			},
			reset: () => {
				Global.set_grid_layout(Global.defaultGridLayout());
				Emitter.emit(GRID_EVENTS.REQUEST_DELETE_LAYOUT);
				refreshInputs();
				folderNotification.show(locale['info.reset_applied']);
			},
			save: () => {
				// self.set();
				Emitter.emit(GRID_EVENTS.REQUEST_SAVE_LAYOUT);
				folderNotification.show(locale['info.settings_saved'], 'warn');
			}
		};

		const widthInput = f.addBinding(state.grid.layout, 'width', {
			label: locale['grid_layout.width'],
			min: 0,
			step: 1
		}).on('change', e => {
			editMode.show();
			if (state.grid.layout.link) {
				state.grid.layout.height = e.value;
				heightInput.refresh();
			}
		});

		const heightInput = f.addBinding(state.grid.layout, 'height', {
			label: locale['grid_layout.height'],
			min: 0,
			step: 1
		}).on('change', e => {
			editMode.show();
			if (state.grid.layout.link) {
				state.grid.layout.width = e.value;
				widthInput.refresh();
			}
		});

		const linkInput = f.addBinding(state.grid.layout, 'link', {
			label: locale['grid_layout.lock_size']
		}).on('change', ()=> editMode.show());

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
				self.set();
				break;
			case '2,0':
				self.save();
				break;
			}
		});

		function refreshInputs() {
			widthInput.refresh();
			heightInput.refresh();
			linkInput.refresh();
		}

		function onAccept() {
			/**
			 * @type {import('@renderer/Global').ClearGlobalData}
			 */
			const backupClearData = {};

			for (let key in state.clear) {
				backupClearData[key] = state.clear[key];
			}

			Global.set_clear({
				grid: true,
				frames: true,
				viewport: false,
				animationController: false
			});

			Emitter.emit(CLEAR_EVENTS.CLEAR);

			Emitter.emit(GRID_EVENTS.CREATE, /** @type {import('@renderer/events/GridEvents').CreateGridData}*/({
				width: state.grid.layout.width,
				height: state.grid.layout.height,
				imageWidth: state.image.width,
				imageHeight: state.image.height,
			}));

			Global.set_clear({
				grid: backupClearData.grid,
				frames: backupClearData.frames,
				viewport: backupClearData.viewport,
				animationController: backupClearData.animationController
			});

			folderNotification.show();
		}
	};

	Emitter.emit(GRID_EVENTS.REQUEST_LOAD_LAYOUT);
	Emitter.on(GRID_EVENTS.REQUEST_LOAD_LAYOUT_COMPLETE, init);
}
