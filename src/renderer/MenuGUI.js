import {FolderApi, Pane} from 'tweakpane';

import { Emitter } from './Emitter';
import { CLEAR_EVENTS } from './events/ClearEvents';
import { GENERAL_EVENTS } from './events/GeneralEvents';
import { GRID_EVENTS } from './events/GridEvents';
import { MENU_EVENTS } from './events/MenuEvents';
import { PREVIEW_EVENTS } from './events/PreviewEvents';
import { SETTINGS_EVENTS } from './events/SettingsEvents';
import { VIEWPORT_EVENTS } from './events/ViewportEvents';
import { Global } from './Global';
import { getLocale } from './locale';
import { WarningPopup } from './popup/WarningPopup';
import { formatValue, fpsToMs, getDivElementById, msToFps, toPx } from './utils';

export function MenuGUI() {
	const state = Global.state;

	const pane = new Pane({
		title: 'Menu',
		expanded: false,
	});

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

	const help = (() => {
		const self = {
			open: () => {
				Emitter.emit(MENU_EVENTS.HELP);
				pane.expanded = false;
			},
		};

		pane.addButton({
			title: 'Help'
		}).on('click', self.open);
	})();

	const upload = (() => {
		const self = {
			open: () => {
				Emitter.emit(MENU_EVENTS.LOAD);
				pane.expanded = false;
			},
		};

		pane.addButton({
			title: 'Load'
		}).on('click', self.open);
	})();

	const animController = (() => {
		let syncInput = false;

		const f = pane.addFolder({
			title: 'Animation Controller',
			expanded: false
		});

		const durationInput = f.addBinding(state.animationController, 'duration', {
			label: getLocale()['anim.milliseconds'],
			min: 0,
			step: 1
		}).on('change', e => {
			if (syncInput) {
				syncInput = false;
				return;
			}
			syncInput = true;
			state.animationController.fpsDuration = msToFps(e.value);
			fpsInput.refresh();
		});

		const fpsInput = f.addBinding(state.animationController, 'fpsDuration', {
			label: getLocale()['anim.fps'],
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
			state.animationController.fpsDuration = formatted;
			state.animationController.duration = fpsToMs(formatted);
			durationInput.refresh();
		});

		f.addBinding(state.animationController, 'loop');
		f.addBinding(state.animationController, 'play');
	})();

	const viewport = (() => {
		const f = pane.addFolder({
			title: 'Viewport',
			expanded: false
		});

		const pz = f.addBinding(state.viewport, 'zoom', {
			min: 0,
			// step: 0.1
		}).on('change', e => {
			Emitter.emit(VIEWPORT_EVENTS.UPDATE_ZOOM, e.value);
		});

		const px = f.addBinding(state.viewport.pan, 'x', {
			// step: 0.1,
		}).on('change', e => {
			Emitter.emit(VIEWPORT_EVENTS.UPDATE_PAN, {x: e.value});
		});

		const py = f.addBinding(state.viewport.pan, 'y', {
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
		const f = pane.addFolder({
			title: 'Preview',
			expanded: false
		});

		const pz = f.addBinding(state.preview, 'zoom', {
			min: 0,
			// step: 0.1
		}).on('change', e => {
			Emitter.emit(PREVIEW_EVENTS.UPDATE_ZOOM, e.value);
		});

		const px = f.addBinding(state.preview.pan, 'x', {
			// step: 0.1,
		}).on('change', e => {
			Emitter.emit(PREVIEW_EVENTS.UPDATE_PAN, {x: e.value});
		});

		const py = f.addBinding(state.preview.pan, 'y', {
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

	const grid = (() => {
		const frames = getDivElementById('frames');
		const title = 'Grid';
		const f = pane.addFolder({
			title,
			expanded: false
		});

		const result = DisplayResult(f);
		const editMode = EditMode(f, title);

		const self = {
			set: () => {
				if (!state.image.src) {
					WarningPopup({text: getLocale()['warn.viewport_is_empty']});
				} else {
					if (frames.children.length) {
						WarningPopup({
							text: getLocale()['warn.will_clear_all_frames'],
							onAccept: onAccept.bind(this),
							onDecline: ()=> {
								Emitter.emit(GRID_EVENTS.REMOVE);
							}
						});
					} else {
						onAccept();
						result.show();
					}
					editMode.hide();
				}
			}
		};

		const widthInput = f.addBinding(state.grid, 'width', {
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
			min: 0,
			step: 1
		}).on('change', e => {
			editMode.show();
			if (state.grid.link) {
				state.grid.width = e.value;
				widthInput.refresh();
			}
		});

		f.addBinding(state.grid, 'link').on('change', ()=> editMode.show());
		f.addBinding(state.grid, 'isShow').on('change', ()=> editMode.show());
		f.addBinding(state.grid, 'color').on('change', ()=> editMode.show());
		f.addBinding(state.grid, 'opacity', {
			min: 0,
			max: 1,
			step:0.1
		}).on('change', ()=> editMode.show());
		f.addButton({
			title: 'set',
		}).on('click', self.set);
		result.add();

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

			if (state.grid.isShow) {
				Emitter.emit(GRID_EVENTS.CREATE, {
					width: state.grid.width,
					height: state.grid.height,
					imageWidth: state.image.width,
					imageHeight: state.image.height,
				});
			}

			Global.set_clear({
				grid: backupClearData.grid,
				frames: backupClearData.frames,
				viewport: backupClearData.viewport,
				animationController: backupClearData.animationController
			});
		}
	})();

	const clear = (() => {
		const title = 'Clear';
		const f = pane.addFolder({
			title,
			expanded: false
		});

		const editMode = EditMode(f, title);
		const result = DisplayResult(f);

		const gridInput = f.addBinding(state.clear, 'grid').on('change', ()=> editMode.show());
		const viewportInput = f.addBinding(state.clear, 'viewport').on('change', ()=> editMode.show());
		const framesInput = f.addBinding(state.clear, 'frames').on('change', ()=> editMode.show());
		const animationControllerInput = f.addBinding(state.clear, 'animationController').on('change', ()=> editMode.show());

		const refreshInputs = () => {
			gridInput.refresh();
			viewportInput.refresh();
			framesInput.refresh();
			animationControllerInput.refresh();
		};

		const self = {
			reset: () => {
				const defaultValues = Global.defaultClear();
				for (let key in defaultValues) {
					state.clear[key] = defaultValues[key];
				}
				refreshInputs();
				editMode.show();
			},
			selectAll: () => {
				state.clear.grid = true;
				state.clear.viewport = true;
				state.clear.frames = true;
				state.clear.animationController = true;
				refreshInputs();
				editMode.show();
			},
			ok: () => {
				if (state.clear.grid) {
					Global.reset('grid');
				}
				if (state.clear.animationController) {
					Global.reset('animationController');
				}
				if (state.clear.viewport) {
					Global.reset('image');
					Global.reset('preview');
					Global.reset('viewport');
				}

				Emitter.emit(CLEAR_EVENTS.CLEAR);
				result.show();
				editMode.hide();
			},
		};

		f.addButton({
			title: 'Reset'
		}).on('click', self.reset);
		f.addButton({
			title: 'Select All'
		}).on('click', self.selectAll);
		f.addButton({
			title: 'Ok'
		}).on('click', self.ok);
		result.add();
	})();

	const remember = (() => {
		const title = 'Remember';
		const f = pane.addFolder({
			title,
			expanded: false
		});

		const editMode = EditMode(f, title);
		const result = DisplayResult(f);

		const gridInput = f.addBinding(state.remember, 'grid').on('change', ()=> editMode.show());
		const viewportInput = f.addBinding(state.remember, 'viewport').on('change', ()=> editMode.show());
		const previewInput = f.addBinding(state.remember, 'preview').on('change', ()=> editMode.show());
		const framesInput = f.addBinding(state.remember, 'frames').on('change', ()=> editMode.show());
		const animationControllerInput = f.addBinding(state.remember, 'animationController').on('change', ()=> editMode.show());
		const sameFileNameOnlyInput = f.addBinding(state.remember, 'sameFileNameOnly', {
			label: 'Apply To Same FileName Only'
		}).on('change', ()=> editMode.show());


		const refreshInputs = () => {
			gridInput.refresh();
			viewportInput.refresh();
			previewInput.refresh();
			framesInput.refresh();
			animationControllerInput.refresh();
			sameFileNameOnlyInput.refresh();
		};

		const self = {
			reset: () => {
				const defaultValues = Global.defaultRemember();
				for (let key in defaultValues) {
					state.remember[key] = defaultValues[key];
				}
				refreshInputs();
				editMode.show();
			},
			selectAll: () => {
				state.remember.grid = true;
				state.remember.viewport = true;
				state.remember.preview = true;
				state.remember.frames = true;
				state.remember.animationController = true;
				state.remember.sameFileNameOnly = true;
				refreshInputs();
				editMode.show();
			},
			ok: () => {
				if (!state.image.src) {
					WarningPopup({text: getLocale()['warn.viewport_is_empty']});
					return;
				} else {
					result.show();
					editMode.hide();
				}
			},
		};

		f.addButton({
			title: 'Reset'
		}).on('click', self.reset);
		f.addButton({
			title: 'Select All'
		}).on('click', self.selectAll);
		f.addButton({
			title: 'Ok'
		}).on('click', self.ok);
		result.add();
	})();

	const settings = (() => {
		const title = 'Settings';
		const f = pane.addFolder({
			title,
			expanded: false
		});

		const editMode = EditMode(f, title);
		const result = DisplayResult(f);
		const viewportBgColorInput = f.addBinding(state.settings.viewport, 'backgroundColor', {
			label: 'Viewport BackgroundColor'
		}).on('change', ()=> editMode.show());
		const previewBgColorInput = f.addBinding(state.settings.preview, 'backgroundColor', {
			label: 'Preview BackgroundColor'
		}).on('change', ()=> editMode.show());
		const pixelatedInput = f.addBinding(state.settings.rendering, 'pixelated').on('change', ()=> editMode.show());

		const refreshInputs = () => {
			viewportBgColorInput.refresh();
			previewBgColorInput.refresh();
			pixelatedInput.refresh();
		};

		const self = {
			reset: () => {
				const defaultValues = Global.defaultSettings();
				state.settings.viewport.backgroundColor = defaultValues.viewport.backgroundColor;
				state.settings.preview.backgroundColor = defaultValues.preview.backgroundColor;
				state.settings.rendering.pixelated = defaultValues.rendering.pixelated;
				refreshInputs();
				editMode.show();
			},
			ok: () => {
				Emitter.emit(SETTINGS_EVENTS.UPDATE);
				result.show();
				editMode.hide();
			},
		};

		f.addButton({
			title: 'Reset'
		}).on('click', self.reset);
		f.addButton({
			title: 'Ok'
		}).on('click', self.ok);
		result.add();
	})();

	const exportMenu = (() => {
		const frames = getDivElementById('frames');
		const f = pane.addFolder({
			title: 'Export',
			expanded: false
		});
		const self = {
			/**
			 * @type {import('./Global').ExportFileType}
			 */
			fileType: 'PNG Sequences',
			suffix: '',
			suffixHelp: {
				help1: {name: 'Grid width', text: ',w{w}'},
				help2: {name: 'Grid height', text: ',h{h}'},
				help3: {name: 'fps', text: ',s{s}'},
			},
			ok: () => {
				pane.expanded = false;

				if (!frames.children.length) {
					WarningPopup({ text: getLocale()['warn.empty_frames'] });

					return;
				}

				const suffix = (() => {
					const suffix = self.suffix
						.replaceAll(/\{\s*w\s*\}/g, String(state.grid.width))
						.replaceAll(/\{\s*h\s*\}/g, String(state.grid.height))
						.replaceAll(/\{\s*s\s*\}/g, String(state.animationController.fpsDuration));
					return suffix;
				})();

				if (state.exportData.isPNGSequences) {
					/**
					 * @type {TExportPngSequencesPayload}
					 */
					const exportPayload = {
						name: state.exportData.fileName,
						suffix: '',
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
						duration: state.animationController.fpsDuration,
						suffix,
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
						suffix,
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

		f.addBinding(state.exportData, 'fileName');
		const suffixInput = f.addBinding(self, 'suffix');

		// suffix how to
		const f1 = f.addFolder({
			title: 'Suffix List:',
			expanded: false
		});
		f1.addButton({
			title: self.suffixHelp.help1.name
		}).on('click', () => {
			self.suffix += self.suffixHelp.help1.text;
			suffixInput.refresh();
		});
		f1.addButton({
			title: self.suffixHelp.help2.name
		}).on('click', () => {
			self.suffix += self.suffixHelp.help2.text;
			suffixInput.refresh();
		});
		f1.addButton({
			title: self.suffixHelp.help3.name
		}).on('click', () => {
			self.suffix += self.suffixHelp.help3.text;
			suffixInput.refresh();
		});

		const showSuffixOptions = () => {
			f1.hidden = false;
			suffixInput.hidden = false;
		};

		const hideSuffixOptions = () => {
			f1.hidden = true;
			suffixInput.hidden = true;
		};

		const fileTypeInput = f.addBinding(self, 'fileType', {
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
				hideSuffixOptions();
			} else {
				showSuffixOptions();
			}
		});

		if (fileTypeInput.controller.value.rawValue === 'PNG Sequences') {
			hideSuffixOptions();
		}

		// spritesheet options
		const f2 = f.addFolder({
			title: 'SpriteSheet',
		});
		f2.addBinding(state.exportData.spriteSheetOptions, 'algorithm', {
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
			min: 0,
			max: 100,
			step: 1
		});

		f.addButton({
			title: 'Ok'
		}).on('click', self.ok);

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

	const extras = (() => {
		const f = pane.addFolder({
			title: 'Extras',
			expanded: false
		});
		const self = {
			close: () => {
				pane.expanded = false;
			},
			closeFolders: () => {
				pane.children.forEach(child => {
					if (child['expanded']) {
						child['expanded'] = false;
					}
				});
			},
		};

		f.addButton({
			title: 'Toggle Debug Menu'
		}).on('click', ()=> {
			Emitter.emit(MENU_EVENTS.TOGGLE_APP_MENUBAR);
		});
		f.addButton({
			title: 'Align Left'
		}).on('click', config.alignLeft);
		f.addButton({
			title: 'Align Right'
		}).on('click', config.alignRight);
		f.addButton({
			title: 'Align Top Middle'
		}).on('click', config.alignTopMiddle);
		f.addButton({
			title: 'Close Folders'
		}).on('click', self.closeFolders);
		f.addButton({
			title: 'Close'
		}).on('click', self.close);
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
 * @param {FolderApi} folder
 * @param {string} [text]
 * @returns {{show:VoidFunction, add:VoidFunction}}
 */
function DisplayResult(folder, text) {
	let timeout;
	let resultInput;

	function add() {
		resultInput = folder.addButton({
			title: text ?? 'Applied New Settings!',
			hidden: true
		});
	}

	function show() {
		if (!resultInput) {
			return;
		}

		if (timeout) {
			clearTimeout(timeout);
			resultInput.hidden = true;
		}

		resultInput.hidden = false;

		timeout = setTimeout(() => {
			resultInput.hidden = true;
		}, 1000);
	}

	return {
		add,
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

