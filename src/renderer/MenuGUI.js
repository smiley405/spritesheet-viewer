import {ButtonApi, FolderApi, Pane, TabPageApi} from 'tweakpane';

import { Emitter } from './Emitter';
import { CLEAR_EVENTS } from './events/ClearEvents';
import { FRAMES_EVENTS } from './events/FramesEvents';
import { GENERAL_EVENTS } from './events/GeneralEvents';
import { GRID_EVENTS } from './events/GridEvents';
import { MENU_EVENTS } from './events/MenuEvents';
import { PREVIEW_EVENTS } from './events/PreviewEvents';
import { SETTINGS_EVENTS } from './events/SettingsEvents';
import { VIEWPORT_EVENTS } from './events/ViewportEvents';
import { Global } from './Global';
import { getLocale } from './locale';
import { WarningPopup } from './popup/WarningPopup';
import { formatValue, fpsToMs, getDivElementById, msToFPS, toPx } from './utils';

// :root is the <html> element
const root = document.documentElement;

export function MenuGUI() {
	const state = Global.state;
	const locale = getLocale();

	const pane = new Pane({
		title: 'Menu',
		expanded: false,
	});

	const tab = pane.addTab({
		pages: [
			{title: locale['menu.tab.general']},
			{title: locale['menu.tab.export']},
			{title: locale['menu.tab.settings']},
			{title: locale['menu.tab.tools']}
		]
	});

	const page1 = tab.pages[0];
	const page2 = tab.pages[1];
	const page3 = tab.pages[2];
	const page4 = tab.pages[3];

	// default config
	const config = {
		enabledScrollY: false,
		init: () => {
			const parentElement = pane.element.parentElement;
			parentElement.style.minWidth = '256px';
			parentElement.style.width = 'fit-content';
			parentElement.style.overflowY = 'auto';
			parentElement.style.overflowX = 'hidden';
			parentElement.style.scrollbarColor = '#161616 #5a5c5d';
			parentElement.style.scrollbarWidth = 'thin';
			config.alignLeft();
		},
		alignLeft: () => {
			pane.element.parentElement.style.right = 'unset';
			pane.element.parentElement.style.left = toPx(8);
			pane.element.parentElement.style.transform = 'none';
		},
		alignRight: () => {
			pane.element.parentElement.style.right = toPx(8);
			pane.element.parentElement.style.left = 'unset';
			pane.element.parentElement.style.transform = 'none';
		},
		alignTopMiddle: () => {
			pane.element.parentElement.style.right = 'unset';
			pane.element.parentElement.style.left = '50%';
			pane.element.parentElement.style.transform = 'translate(-50%, 0)';
		},
		update: () => {
			const parentElement = pane.element.parentElement;

			if (pane.element.offsetHeight > window.innerHeight - 20) {
				if (!config.enabledScrollY) {
					parentElement.style.bottom = '8px';
					config.enabledScrollY = true;
				}
			} else {
				if (config.enabledScrollY) {
					config.enabledScrollY = false;
					parentElement.style.bottom = 'unset';
				}
			}
		}
	};

	config.init();

	const commonOptions = () => {
		const pages = [page1, page2, page3];
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
	};

	const help = (() => {
		const self = {
			open: () => {
				Emitter.emit(MENU_EVENTS.HELP);
				pane.expanded = false;
			},
		};

		page1.addButton({
			title: locale['menu.help']
		}).on('click', self.open);
	})();

	const load = (() => {
		const self = {
			open: () => {
				Emitter.emit(MENU_EVENTS.LOAD);
				pane.expanded = false;
			},
		};

		page1.addButton({
			title: locale['menu.load']
		}).on('click', self.open);
	})();

	commonOptions();

	const animController = (() => {
		let syncInput = false;

		const f = page1.addFolder({
			title: locale['anim.title'],
			expanded: false
		});

		const f1 = f.addFolder({
			title: locale['anim.durationMs'],
			expanded: true
		});
		const f2 = f.addFolder({
			title: locale['anim.frameRate'],
			expanded: true
		});

		const durationMsInput = f1.addBinding(state.animationController, 'durationMs', {
			label: '',
			min: 0,
			step: 0.1
		}).on('change', e => {
			if (syncInput) {
				syncInput = false;
				return;
			}
			syncInput = true;
			state.animationController.frameRate = msToFPS(e.value);
			fpsInput.refresh();
		});

		const fpsInput = f2.addBinding(state.animationController, 'frameRate', {
			label: '',
			min: 0,
			step: 0.1
		}).on('change', e => {
			if (syncInput) {
				syncInput = false;
				return;
			}
			syncInput = true;
			// Will return 2-decimal rounded value
			const formatted = formatValue(e.value);
			state.animationController.frameRate = formatted;
			state.animationController.durationMs = fpsToMs(formatted);
			durationMsInput.refresh();
		});

		f.addBinding(state.animationController, 'loop', {
			label: locale['anim.loop']
		});
		const playStatInput = f.addBinding(state.animationController, 'play', {
			label: locale['anim.playMode'],
			disabled: true,
		});

		const isFrameEnded = () => {
			return state.preview.activeFrameIndex === state.preview.totalFrames - 1;
		};

		const self = {
			play: () => {
				if (isFrameEnded()) {
					self.restart();
				}
				playStatInput.controller.value.setRawValue(true);
			},
			restart: () => {
				Global.set_preview({
					activeFrameIndex: 0
				});
				Emitter.emit(FRAMES_EVENTS.RESTART);
			},
			stop: () => {
				playStatInput.controller.value.setRawValue(false);
			}
		};
		f.addButton({
			title: locale['btn.restart']
		}).on('click', self.restart);
		f.addButton({
			title: locale['btn.play']
		}).on('click', self.play);
		f.addButton({
			title: locale['btn.stop']
		}).on('click', self.stop);

		// Tweakpane steals Spacebar, override it
		// fully disable or intercept Spacebar before Tweakpane receives it
		window.addEventListener('keydown', (e) => {
			if (e.code === 'Space') {
				e.preventDefault();
				e.stopPropagation();
			}
		});

		// spacebar toggles play/stop
		Global.keyboard('space').press = () => {
			if (state.animationController.play) {
				self.stop();
			} else {
				self.play();
			}
		};
	})();

	const grid = (() => {
		const frames = getDivElementById('frames');
		const title = locale['grid.title'];
		const f = page1.addFolder({
			title,
			expanded: false
		});

		const folderNotification = ShowFolderNotification(f);
		const editMode = EditMode(f, title);

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
				Global.set_grid(Global.defaultGrid());
				refreshInputs();
				folderNotification.show(locale['info.reset_applied']);
			},
		};

		const widthInput = f.addBinding(state.grid, 'width', {
			label: locale['grid.width'],
			min: 0,
			step: 1
		}).on('change', e => {
			editMode.show();
			if (state.grid.link) {
				state.grid.height = e.value;
				heightInput.refresh();
			}
		});

		const heightInput = f.addBinding(state.grid, 'height', {
			label: locale['grid.height'],
			min: 0,
			step: 1
		}).on('change', e => {
			editMode.show();
			if (state.grid.link) {
				state.grid.width = e.value;
				widthInput.refresh();
			}
		});

		const linkInput = f.addBinding(state.grid, 'link', {
			label: locale['grid.lock_size']
		}).on('change', ()=> editMode.show());
		const showInput = f.addBinding(state.grid, 'visible', {
			label: locale['grid.visible']
		}).on('change', ()=> editMode.show());
		const colorInput = f.addBinding(state.grid, 'color', {
			label: locale['grid.color']
		}).on('change', ()=> editMode.show());
		const opacityInput = f.addBinding(state.grid, 'opacity', {
			label: locale['grid.opacity'],
			min: 0,
			max: 1,
			step:0.1
		}).on('change', ()=> editMode.show());
		f.addButton({
			title: locale['btn.reset'],
		}).on('click', self.reset);
		f.addButton({
			title: locale['btn.apply'],
		}).on('click', self.set);

		function refreshInputs() {
			widthInput.refresh();
			heightInput.refresh();
			linkInput.refresh();
			showInput.refresh();
			colorInput.refresh();
			opacityInput.refresh();
		}

		function onAccept() {
			/**
			 * @type {import('./Global').ClearGlobalData}
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

			if (state.grid.visible) {
				Emitter.emit(GRID_EVENTS.CREATE, /** @type {import('./events/GridEvents').CreateGridData}*/({
					width: state.grid.width,
					height: state.grid.height,
					imageWidth: state.image.width,
					imageHeight: state.image.height,
				}));
			}

			Global.set_clear({
				grid: backupClearData.grid,
				frames: backupClearData.frames,
				viewport: backupClearData.viewport,
				animationController: backupClearData.animationController
			});

			folderNotification.show();
		}
	})();

	const viewport = (() => {
		const f = page1.addFolder({
			title: locale['viewport.title'],
			expanded: false
		});

		const pz = f.addBinding(state.viewport, 'zoom', {
			label: locale['viewport.zoom'],
			min: 0,
			// step: 0.1
		}).on('change', e => {
			Emitter.emit(VIEWPORT_EVENTS.UPDATE_ZOOM, e.value);
		});

		const px = f.addBinding(state.viewport.pan, 'x', {
			label: locale['viewport.x'],
			// step: 0.1,
		}).on('change', e => {
			Emitter.emit(VIEWPORT_EVENTS.UPDATE_PAN, {x: e.value});
		});

		const py = f.addBinding(state.viewport.pan, 'y', {
			label: locale['viewport.y']
			// step: 0.1,
		}).on('change', e => {
			Emitter.emit(VIEWPORT_EVENTS.UPDATE_PAN, {y: e.value});
		});

		const update = () => {
			pz.controller.value.setRawValue(state.viewport.zoom, {forceEmit: false, last: true});
			px.controller.value.setRawValue(state.viewport.pan.x, {forceEmit: false, last: true});
			py.controller.value.setRawValue(state.viewport.pan.y, {forceEmit: false, last: true});
		};

		return {update};
	})();

	const preview = (() => {
		const f = page1.addFolder({
			title: locale['preview.title'],
			expanded: false
		});

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

		const update = () => {
			pz.controller.value.setRawValue(state.preview.zoom, {forceEmit: false, last: true});
			px.controller.value.setRawValue(state.preview.pan.x, {forceEmit: false, last: true});
			py.controller.value.setRawValue(state.preview.pan.y, {forceEmit: false, last: true});
		};

		return {update};
	})();


	const clear = (() => {
		const title = locale['clear.title'];
		const f = page1.addFolder({
			title,
			expanded: false
		});

		const editMode = EditMode(f, title);
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
	})();

	const exportMenu = (() => {
		const frames = getDivElementById('frames');
		const f = page2;
		const self = {
			/**
			 * @type {import('./Global').ExportFileType}
			 */
			fileType: 'PNG Sequences',
			fileNameTags: '',
			tagList: {
				tag1: {name: locale['export.tag.gridWidth'], text: ',w{w}'},
				tag2: {name: locale['export.tag.gridHeight'], text: ',h{h}'},
				tag3: {name: locale['export.tag.frameRate'], text: ',s{s}'},
			},
			confirm: () => {
				pane.expanded = false;

				if (!frames.children.length) {
					pane.expanded = false;
					WarningPopup({ text: locale['warn.empty_frames'] });

					return;
				}

				const fileNameTags = (() => {
					const tags = self.fileNameTags
						.replaceAll(/\{\s*w\s*\}/g, String(state.grid.width))
						.replaceAll(/\{\s*h\s*\}/g, String(state.grid.height))
						.replaceAll(/\{\s*s\s*\}/g, String(state.animationController.frameRate));
					return tags;
				})();

				if (state.exportData.isPNGSequences) {
					/**
					 * @type {TExportPngSequencesPayload}
					 */
					const exportPayload = {
						name: state.exportData.fileName,
						fileNameTags: '',
						images: []
					};

					for (let i = 0; i < frames.children.length; i++) {
						const canvas = /** @type {HTMLCanvasElement}*/(frames.children[i].children[0]);
						const src = canvas.toDataURL('image/png', 0.9);
						exportPayload.images.push(src);
					}

					Emitter.emit(GENERAL_EVENTS.SAVE_PNG_SEQUENCES, exportPayload);
				}

				if (state.exportData.isGIF) {
					/**
					 * @type {TExportGifPayload}
					 */
					const exportPayload = {
						name: state.exportData.fileName,
						width: state.grid.width,
						height: state.grid.height,
						duration: state.animationController.frameRate,
						fileNameTags,
						images: []
					};

					for (let i = 0; i < frames.children.length; i++) {
						const canvas = /** @type {HTMLCanvasElement}*/(frames.children[i].children[0]);
						const src = canvas.toDataURL('image/png', 0.9);
						exportPayload.images.push(src);
					}

					Emitter.emit(GENERAL_EVENTS.SAVE_GIF, exportPayload);
				}

				if (state.exportData.isSpriteSheet) {
					/**
					 * @type {TExportSpriteSheetPayload}
					 */
					const exportPayload = {
						name: state.exportData.fileName,
						padding: state.exportData.spriteSheetOptions.padding,
						algorithm: state.exportData.spriteSheetOptions.algorithm,
						fileNameTags,
						images: []
					};

					for (let i = 0; i < frames.children.length; i++) {
						const canvas = /** @type {HTMLCanvasElement}*/(frames.children[i].children[0]);
						const src = canvas.toDataURL('image/png', 0.9);
						exportPayload.images.push(src);
					}

					Emitter.emit(GENERAL_EVENTS.SAVE_SPRITE_SHEET, exportPayload);
				}
			},
		};

		f.addBinding(state.exportData, 'fileName' , {
			label: locale['export.file_name']
		});
		const fileNameTagsInput = f.addBinding(self, 'fileNameTags', {
			label: locale['export.file_name_tags']
		});

		// filename tags buttons
		const f1 = f.addFolder({
			title: locale['export.tag.list_title'],
			expanded: false
		});
		f1.addButton({
			title: self.tagList.tag1.name
		}).on('click', () => {
			self.fileNameTags += self.tagList.tag1.text;
			fileNameTagsInput.refresh();
		});
		f1.addButton({
			title: self.tagList.tag2.name
		}).on('click', () => {
			self.fileNameTags += self.tagList.tag2.text;
			fileNameTagsInput.refresh();
		});
		f1.addButton({
			title: self.tagList.tag3.name
		}).on('click', () => {
			self.fileNameTags += self.tagList.tag3.text;
			fileNameTagsInput.refresh();
		});

		const showTagList = () => {
			f1.hidden = false;
			fileNameTagsInput.hidden = false;
		};

		const hideTagList = () => {
			f1.hidden = true;
			fileNameTagsInput.hidden = true;
		};

		const fileTypeInput = f.addBinding(self, 'fileType', {
			label: locale['export.file_type'],
			// /** @type{import('./Global').ExportFileType[]} */
			options: {
				['PNG Sequences']:'PNG Sequences',
				['GIF']: 'GIF',
				['SpriteSheet']: 'SpriteSheet'
			}
		}).on('change', ({ /** @type {import('./Global').ExportFileType}*/value }) => {
			state.exportData.isPNGSequences = value === 'PNG Sequences';
			state.exportData.isGIF = value === 'GIF';
			state.exportData.isSpriteSheet = value === 'SpriteSheet';
			toggleSpriteSheetOptions();

			if (value === 'PNG Sequences') {
				hideTagList();
			} else {
				showTagList();
			}
		});

		if (fileTypeInput.controller.value.rawValue === 'PNG Sequences') {
			hideTagList();
		}

		// spritesheet options
		const f2 = f.addFolder({
			title: locale['export.spritesheet'],
		});
		f2.addBinding(state.exportData.spriteSheetOptions, 'algorithm', {
			label: locale['export.spritesheet_algorithm'],
			// /** @type{TSpriteSheetAlgorithm[]} */
			options: {
				['left-right']: 'left-right',
				['top-down']: 'top-down',
				['binary-tree']: 'binary-tree',
				['diagonal']: 'diagonal',
				['alt-diagonal']: 'alt-diagonal'
			}
		});

		f2.addBinding(state.exportData.spriteSheetOptions, 'padding', {
			label: locale['export.spritesheet_padding'],
			min: 0,
			max: 100,
			step: 1
		});

		f.addButton({
			title: locale['btn.confirm']
		}).on('click', self.confirm);

		toggleSpriteSheetOptions();

		function toggleSpriteSheetOptions() {
			if (!f2) {
				return;
			}
			if (state.exportData.isSpriteSheet) {
				f2.hidden = false;
			} else {
				f2.hidden = true;
			}
		}
	})();

	const remember = (() => {
		const f = page3.addFolder({
			title: locale['remember.title'],
			expanded: false
		});

		const editMode = EditMode(f, f.title);
		const folderNotification = ShowFolderNotification(f);

		const gridInput = f.addBinding(state.remember, 'grid', {
			label: locale['remember.grid']
		}).on('change', ()=> editMode.show());
		const viewportInput = f.addBinding(state.remember, 'viewport', {
			label: locale['remember.preview']
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

	})();

	const interfaceSettings = (() => {
		const f = page3.addFolder({
			title: locale['interface_settings.title'],
			expanded: false
		});

		const editMode = EditMode(f, f.title);
		const folderNotification = ShowFolderNotification(f);

		const init = () => {
			const viewportBgColorInput = f.addBinding(state.settings.viewport, 'backgroundColor', {
				label: locale['interface_settings.viewport_background_color']
			}).on('change', ()=> editMode.show());

			const previewBgColorInput = f.addBinding(state.settings.preview, 'backgroundColor', {
				label: locale['interface_settings.preview_background_color']
			}).on('change', ()=> editMode.show());

			const framesBgColorInput = f.addBinding(state.settings.framesCollection, 'backgroundColor', {
				label: locale['interface_settings.frames_background_color']
			}).on('change', ()=> editMode.show());

			const pixelatedInput = f.addBinding(state.settings.rendering, 'pixelated', {
				label: locale['interface_settings.rendering_pixelated']
			}).on('change', ()=> editMode.show());

			const themeInput = f.addBinding(state.settings, 'theme', {
				label: locale['interface_settings.theme'],
				/** @type{Record<UITheme, UITheme>}} */
				options: {
					Default: 'Default',
					Iceberg: 'Iceberg',
					Jetblack: 'Jetblack',
					Light: 'Light',
					Retro: 'Retro',
					Translucent: 'Translucent',
					Vivid: 'Vivid',
				},
			}).on('change', ({ /** @type {UITheme}*/value }) => {
				setMenuTheme(value);
			});

			// load default theme
			setMenuTheme(state.settings.theme);

			const refreshInputs = () => {
				viewportBgColorInput.refresh();
				previewBgColorInput.refresh();
				framesBgColorInput.refresh();
				pixelatedInput.refresh();
				themeInput.refresh();
			};

			const self = {
				reset: () => {
					const defaultValues = Global.defaultSettings();
					state.settings.viewport.backgroundColor = defaultValues.viewport.backgroundColor;
					state.settings.preview.backgroundColor = defaultValues.preview.backgroundColor;
					state.settings.framesCollection.backgroundColor = defaultValues.framesCollection.backgroundColor;
					state.settings.rendering.pixelated = defaultValues.rendering.pixelated;
					state.settings.theme = defaultValues.theme;
					refreshInputs();
					self.ok();
					editMode.hide();
					Emitter.emit(SETTINGS_EVENTS.REQUEST_DELETE);
					folderNotification.show(locale['info.reset_applied']);
				},
				ok: () => {
					Emitter.emit(SETTINGS_EVENTS.UPDATE);
					folderNotification.show();
					editMode.hide();
				},
				save: () => {
					Emitter.emit(SETTINGS_EVENTS.REQUEST_SAVE);
					folderNotification.show(locale['info.settings_saved'], 'warn');
				},
			};

			f.addButton({
				title: locale['btn.reset']
			}).on('click', self.reset);
			f.addButton({
				title: locale['btn.apply']
			}).on('click', self.ok);
			f.addButton({
				title: locale['btn.save']
			}).on('click', self.save);
		};

		Emitter.emit(SETTINGS_EVENTS.REQUEST_LOAD);
		Emitter.on(SETTINGS_EVENTS.REQUEST_LOAD_COMPLETE, init);
	})();

	const tools = (() => {
		const f = page4;

		f.addButton({
			title: locale['tools.align_left']
		}).on('click', config.alignLeft);
		f.addButton({
			title: locale['tools.align_right']
		}).on('click', config.alignRight);
		f.addButton({
			title: locale['tools.align_top_middle']
		}).on('click', config.alignTopMiddle);
		f.addButton({
			title: locale['tools.toggle_debug_menu']
		}).on('click', ()=> {
			Emitter.emit(MENU_EVENTS.TOGGLE_APP_MENUBAR);
		});
	})();

	Global.ticker.add('update', () => {
		update();
		config.update();
	});

	function update() {
		viewport.update();
		preview.update();
	}
}

/**
 * @typedef {(message?: string, color?: NotificationType) => void} ShowNotification
 * @param {FolderApi} folder
 * @returns {{show: ShowNotification}}
 */
function ShowFolderNotification(folder) {
	let timeout;
	/**
	 * @type {ButtonApi}
	 */
	let notification;

	const defaultMessage = getLocale()['info.selected_settings_appied'];

	create();

	function create() {
		notification = folder.addButton({
			title: defaultMessage,
			hidden: true
		});
		notification.controller.buttonController.view.buttonElement.classList.add('folder-notification-success');
	}

	/**
	 * @param {NotificationType} [color] 
	 * @returns {void}
	 */
	function setColor(color='success') {
		const buttonElement = notification.controller.buttonController.view.buttonElement;
		const classList = [
			'folder-notification-warn',
			'folder-notification-failed',
			'folder-notification-success',
		];
		let className = '';

		switch (color) {
		case 'warn':
			className = classList[0];
			break;

		case 'failed':
			className = classList[1];
			break;

		default:
			className = classList[2];
			break;
		}

		classList.forEach(id => {
			if (buttonElement.classList.contains(id)) {
				buttonElement.classList.remove(id);
			}
		});

		buttonElement.classList.add(className);
	}

	/**
	 * @type {ShowNotification} 
	 */
	function show(message, color='success') {
		if (!notification) {
			return;
		}

		notification.title = message ?? defaultMessage;

		setColor(color);

		if (timeout) {
			clearTimeout(timeout);
			notification.hidden = true;
		}

		notification.hidden = false;

		timeout = setTimeout(() => {
			notification.hidden = true;
		}, 1000);
	}

	return {
		show,
	};
}

/**
 * @param {FolderApi} folder
 * @param {string} title
 * @returns {{show:VoidFunction, hide:VoidFunction}}
 */
function EditMode(folder, title) {
	return {
		show: () => {
			folder.title = `${title}*`;
		},
		hide: () => {
			folder.title = `${title}`;
		}
	};
};


/**
 * @param {UITheme} theme 
 * @returns {void}
 */
function setMenuTheme(theme) {
	/**
	 * @type {string[]}
	 */
	const preset = [
		'tweakpane-theme-iceberg',
		'tweakpane-theme-jetblack',
		'tweakpane-theme-light',
		'tweakpane-theme-retro',
		'tweakpane-theme-translucent',
		'tweakpane-theme-vivid',
	];

	let currentPreset = '';

	switch (theme) {
	case 'Iceberg':
		currentPreset = preset[0];
		break;
	case 'Jetblack':
		currentPreset = preset[1];
		break;
	case 'Light':
		currentPreset = preset[2];
		break;
	case 'Retro':
		currentPreset = preset[3];
		break;
	case 'Translucent':
		currentPreset = preset[4];
		break;
	case 'Vivid':
		currentPreset = preset[5];
		break;
	}

	preset.forEach(id => {
		if (root.classList.contains(id)) {
			root.classList.remove(id);
		}
	});

	if (currentPreset) {
		root.classList.add(currentPreset);
	}

}
