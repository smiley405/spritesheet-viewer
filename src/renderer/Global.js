import { Keyboard } from './Keyboard';
import { getLocale } from './locale';
import { Ticker } from './Ticker';
import { msToFPS } from './utils';

/**
 * @typedef {'PNG Sequences'|'GIF'|'SpriteSheet'} ExportFileType
 */

/**
 * @typedef {{width?: number, height?: number, src?: string, currentFileName?: string, pervFileName?: string}} ImageGlobalData
 */

/**
 * @typedef {{
 * width?: number,
 * height?: number,
 * prevWidth?: number,
 * prevHeight?: number,
 * totalX?: number,
 * totalY?: number,
 * link?: boolean,
 * }} GridLayoutGlobalData
 */

/**
 * @typedef {{
 * visible?: boolean,
 * color?: string,
 * opacity?: number
 * lineThickness?: number // 0.1 to 1
 * }} GridAppearanceGlobalData
 */

/**
 * @typedef {{layout: GridLayoutGlobalData, appearance: GridAppearanceGlobalData}} GridGlobalData
 */

/**
 * @typedef {{activeFrameIndex?: number, totalFrames?: number, zoom?: number, pan?: PanGlobalData}} PreviewGlobalData
 */

/**
 * @typedef {{zoom?: number, pan?: PanGlobalData}} ViewportGlobalData
 */

/**
 * @typedef {{x?: number, y?: number}} PanGlobalData
 */

/**
 * @typedef {object} TSpriteSheetOptions
 * @property {TSpriteSheetAlgorithm} algorithm
 * @property {number} padding
 */

/**
 * @typedef {{fileName?: string, isPNGSequences?: boolean, isGIF?: boolean, GIFQuality?: number, isSpriteSheet?: boolean, spriteSheetOptions?: TSpriteSheetOptions}} ExportGlobalData
 */

/**
 * @typedef {{grid?: boolean, viewport?: boolean, preview?: boolean, frames?: boolean, sameFileNameOnly?: boolean}} RememberGlobalData
 */

/**
 * @typedef {{grid?: boolean, viewport?: boolean, frames?: boolean, animationController?: boolean}} ClearGlobalData
 */

/**
 * @typedef {'grid'|'image'|'animationController'|'preview'|'viewport'|'settings'|'clear'|'remember'} GlobalDataType
 */

/**
 * @typedef {{backgroundColor: string}} SettingsPreviewGlobalData
 */

/**
 * @typedef {{pixelated: boolean}} SettingsRenderingGlobalData
 */

/**
 * @typedef {{viewport: SettingsPreviewGlobalData, preview: SettingsPreviewGlobalData, framesCollection: SettingsPreviewGlobalData, rendering: SettingsRenderingGlobalData, theme: UITheme}} SettingsGlobalData
 */

/**
 * @typedef {object} AnimationControllerGlobalData
 * @property {boolean} [loop]
 * @property {number} [durationMs] in milliseconds
 * @property {number} [frameRate]
 * @property {boolean} [play]
 * @property {boolean} [toggleFps]
 */

function CreateGlobal() {
	const ticker = Ticker();

	/**
	 * @type {import('./Keyboard').KeyboardReturns}
	 */
	let keyboard;

	const state = {
		preview: defaultPreview(),
		animationController: defaultAnimationController(),
		grid: defaultGrid(),
		image: defaultImage(),
		remember: defaultRemember(),
		clear: defaultClear(),
		appInfo: defaultAppInfo(),
		viewport: defaultViewport(),
		exportData: defaultExportData(),
		settings: defaultSettings(),
	};

	/**
	 * @param {object} obj
	 * @param {object} data
	 */
	function mutate_object(obj, data) {
		for (let key in data) {
			if (obj.hasOwnProperty(key)) {
				obj[key] = data[key];
			}
		}
	}

	/**
	 * @returns {TAppInfo}
	 */
	function defaultAppInfo() {
		return {
			name: '',
			version: ''
		};
	}

	/**
	 * @returns {GridGlobalData}
	 */
	function defaultGrid() {
		return {layout: defaultGridLayout(), appearance: defaultGridAppearance()};
	}

	/**
	 * @returns {GridLayoutGlobalData}
	 */
	function defaultGridLayout() {
		const w = 8;
		const h = 8;

		return {
			width: w,
			height: h,
			prevWidth: 8,
			prevHeight: 8,
			totalX: 0,
			totalY: 0,
			link: true,
		};
	}

	/**
	 * @returns {GridAppearanceGlobalData}
	 */
	function defaultGridAppearance() {
		return {
			/**
			 * Represents the thickness of grid lines -> 0.1 to 1
			 */
			lineThickness: 0.9,
			visible: true,
			color: '#ccc4dd',
			opacity: 0.4,
		};
	}

	/**
	 * @returns {ImageGlobalData}
	 */
	function defaultImage() {
		return {
			height: 0,
			width: 0,
			src: '',
			currentFileName: '',
			pervFileName: '',
		};
	}

	/**
	 * @returns {AnimationControllerGlobalData}
	 */
	function defaultAnimationController() {
		const durationMs = 100;

		return {
			loop: true,
			// in milliseconds
			durationMs,
			frameRate: msToFPS(durationMs),
			play: true,
			toggleFps: false
		};
	}

	/**
	 * @returns {PreviewGlobalData}
	 */
	function defaultPreview() {
		return {
			activeFrameIndex: 0,
			totalFrames: 0,
			zoom: 1,
			pan: {
				x: 1029,
				y: 100
			},
		};
	}

	/**
	 * @returns {ViewportGlobalData}
	 */
	function defaultViewport() {
		return {
			zoom: 1,
			pan: {
				x: 0,
				y: 0
			}
		};
	}

	/**
	 * @returns {RememberGlobalData}
	 */
	function defaultRemember() {
		return {
			grid: true,
			viewport: true,
			preview: true,
			frames: true,
			sameFileNameOnly: true
		};
	}

	/**
	 * @returns {ClearGlobalData}
	 */
	function defaultClear() {
		return {
			grid: false,
			viewport: false,
			frames: false,
			animationController: false
		};
	}

	/**
	 * @returns {ExportGlobalData}
	 */
	function defaultExportData() {
		return {
			fileName: getLocale()['export.default_file_name'],
			isPNGSequences: true,
			isGIF: false,
			isSpriteSheet: false,
			GIFQuality: 10,
			spriteSheetOptions: {
				algorithm: 'left-right',
				padding: 0
			}
		};
	}

	/**
	 * @returns {SettingsGlobalData}
	 */
	function defaultSettings() {
		return {
			rendering: {
				pixelated: true
			},
			viewport: {
				backgroundColor: '#454545',
			},
			preview: {
				backgroundColor: '#454545',
			},
			framesCollection: {
				backgroundColor: '#383838',
			},
			theme: 'Retro'
		};
	}

	/**
	 * @param {GlobalDataType} type
	 */
	function reset(type) {
		switch (type) {
		case 'grid':
			state.grid = defaultGrid();
			break;

		case 'image':
			state.image = defaultImage();
			break;

		case 'animationController':
			state.animationController = defaultAnimationController();
			break;

		case 'preview':
			state.preview = defaultPreview();
			break;

		case 'viewport':
			state.viewport = defaultViewport();
			break;

		case 'settings':
			state.settings = defaultSettings();
			break;

		case 'clear':
			state.clear = defaultClear();
			break;

		case 'remember':
			state.remember = defaultRemember();
			break;
		}
	}

	return {
		ticker,
		state,
		/**
		 * @param {PreviewGlobalData} data
		 */
		set_preview(data) {
			mutate_object(state.preview, data);
		},

		/**
		 * @param {AnimationControllerGlobalData} data
		 */
		set_animation_controller(data) {
			mutate_object(state.animationController, data);
		},

		/**
		 * @param {import("./Keyboard").keysId} keyId
		 * @returns {import("./Keyboard").keyData}
		 */
		keyboard(keyId) {
			return keyboard.getKey(keyId);
		},

		/**
		 * @param {import("./Keyboard").keyCodes} keyCodes
		 */
		set_keyboard(keyCodes) {
			keyboard = keyboard || Keyboard(keyCodes);
		},

		/**
		 * @param {Partial<GridAppearanceGlobalData>} data
		 */
		set_grid_appearance(data) {
			mutate_object(state.grid.appearance, data);
		},

		/**
		 * @param {Partial<GridLayoutGlobalData>} data
		 */
		set_grid_layout(data) {
			mutate_object(state.grid.layout, data);
		},

		/**
		 * @param {ImageGlobalData} data
		 */
		set_image(data) {
			mutate_object(state.image, data);
		},

		/**
		 * @param {RememberGlobalData} data
		 */
		set_remember(data) {
			mutate_object(state.remember, data);
		},

		/**
		 * @param {ClearGlobalData} data
		 */
		set_clear(data) {
			mutate_object(state.clear, data);
		},

		/**
		 * @param {TAppInfo} data
		 */
		set_app_info(data) {
			mutate_object(state.appInfo, data);
		},

		/**
		 * @param {ViewportGlobalData} data
		 */
		set_viewport(data) {
			mutate_object(state.viewport, data);
		},

		/**
		 * @param {ExportGlobalData} data
		 */
		set_export_data(data) {
			mutate_object(state.exportData, data);
		},

		/**
		 * @param {SettingsGlobalData} data
		 */
		set_settings(data) {
			mutate_object(state.settings, data);
		},

		didGridDimensionsChange() {
			return !(Global.state.grid.layout.prevWidth === Global.state.grid.layout.width && Global.state.grid.layout.prevHeight === Global.state.grid.layout.height);
		},

		is_first_fresh_image_loaded() {
			return (
				state.image.pervFileName === '' && state.image.currentFileName
			);
		},
		is_same_image_reloaded() {
			return (
				state.image.pervFileName !== '' &&
				state.image.currentFileName !== '' &&
				state.image.currentFileName === state.image.pervFileName
			);
		},

		is_apply_previous_viewport_settings() {
			return (
				state.remember.viewport &&
				!this.is_first_fresh_image_loaded() &&
				this.is_same_image_reloaded() &&
				state.remember.sameFileNameOnly
			);
		},

		reset,
		defaultPreview,
		defaultViewport,
		defaultClear,
		defaultRemember,
		defaultSettings,
		defaultGrid,
		defaultGridAppearance,
		defaultGridLayout,
	};
}

export const Global = CreateGlobal();
