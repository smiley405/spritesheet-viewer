import { ERROE_CODE } from './const';
import { Emitter } from './Emitter';
import { ANIMATION_CONTROLS_EVENTS } from './events/AnimationControlsEvents';
import { GENERAL_EVENTS } from './events/GeneralEvents';
import { GRID_EVENTS } from './events/GridEvents';
import { MENU_EVENTS } from './events/MenuEvents';
import { PREVIEW_EVENTS } from './events/PreviewEvents';
import { SETTINGS_EVENTS } from './events/SettingsEvents';
import { UPLOADER_EVENTS } from './events/UploaderEvents';
import { Global } from './Global';
import { getLocale } from './locale';
import { ErrorPopup } from './popup/ErrorPopup';
import { ExportCompletedPopup } from './popup/ExportCompletedPopup';
import { ExportProgressPopup } from './popup/ExportProgressPopup';
import { WarningPopup } from './popup/WarningPopup';

export function IPCRenderer() {
	const state = /** @type {TElectronBridgeState} */(/** @type {*} */(window).state);

	Emitter.on(GENERAL_EVENTS.SAVE_PNG_SEQUENCES, (payload) => {
		invokeSavePngSequences(payload);
	});

	Emitter.on(GENERAL_EVENTS.SAVE_GIF, (payload) => {
		invokeSaveGif(payload);
	});

	Emitter.on(GENERAL_EVENTS.SAVE_SPRITE_SHEET, (payload) => {
		invokeSaveSpriteSheet(payload);
	});

	Emitter.on(GENERAL_EVENTS.REQUEST_PACKAGE_JSON, () => {
		invokePackageJSON();
	});

	Emitter.on(UPLOADER_EVENTS.PRELOAD, (file) => {
		state.dropFile(file);
	});

	Emitter.on(MENU_EVENTS.TOGGLE_APP_MENUBAR, () => {
		state.toggleAppMenubar();
	});

	// interface
	Emitter.on(SETTINGS_EVENTS.REQUEST_SAVE, () => {
		state.saveRecord({id: 'settings', value: Global.state.settings});
	});

	Emitter.on(SETTINGS_EVENTS.REQUEST_DELETE, () => {
		state.deleteRecord({id: 'settings'});
	});

	Emitter.on(SETTINGS_EVENTS.REQUEST_LOAD, async() => {
		/**
		 * @type {SettingsGlobalData}
		 */
		const settings = await state.getRecord({id: 'settings'});

		if (settings) {
			Global.set_settings(settings);
			Emitter.emit(SETTINGS_EVENTS.UPDATE);
		}
		Emitter.emit(SETTINGS_EVENTS.REQUEST_LOAD_COMPLETE);
	});

	// grid
	Emitter.on(GRID_EVENTS.REQUEST_SAVE_APPEARANCE, async() => {
		state.saveRecord({id: 'grid_appearance', value: Global.state.grid.appearance});
	});

	Emitter.on(GRID_EVENTS.REQUEST_DELETE_APPEARANCE, async() => {
		state.deleteRecord({id: 'grid_appearance'});
	});

	Emitter.on(GRID_EVENTS.REQUEST_SAVE_LAYOUT, () => {
		state.saveRecord({id: 'grid_layout', value: Global.state.grid.layout});
	});

	Emitter.on(GRID_EVENTS.REQUEST_DELETE_LAYOUT, () => {
		state.deleteRecord({id: 'grid_layout'});
	});

	Emitter.on(GRID_EVENTS.REQUEST_LOAD_APPEARANCE, async() => {
		/**
		 * @type {GridAppearanceGlobalData}
		 */
		let gridAppearance = await state.getRecord({id: 'grid_appearance'});

		/**
		 * @deprecated - will be deleted after v1.2.5. This is an old way of saving the grid records
		 * @type {GridGlobalData}
		 */
		const grid = await state.getRecord({id: 'grid'});
		// Make sure the deprecated settings still works in newer versions
		if (grid?.appearance && !gridAppearance) {
			gridAppearance = grid.appearance;
			state.deleteRecord({id: 'grid'});
			state.saveRecord({id: 'grid_appearance', value: gridAppearance});
		}

		// New way of saving grid records
		if (gridAppearance) {
			Global.set_grid_appearance(gridAppearance);
			Emitter.emit(GRID_EVENTS.UPDATE_SETTINGS);
		}
		Emitter.emit(GRID_EVENTS.REQUEST_LOAD_APPEARANCE_COMPLETE);
	});

	Emitter.on(GRID_EVENTS.REQUEST_LOAD_LAYOUT, async() => {
		/**
		 * @type {GridLayoutGlobalData}
		 */
		const gridLayout = await state.getRecord({id: 'grid_layout'});
		if (gridLayout) {
			Global.set_grid_layout(gridLayout);
			Emitter.emit(GRID_EVENTS.UPDATE_SETTINGS);
		}
		Emitter.emit(GRID_EVENTS.REQUEST_LOAD_LAYOUT_COMPLETE);
	});


	// animation controls
	Emitter.on(ANIMATION_CONTROLS_EVENTS.REQUEST_SAVE, () => {
		state.saveRecord({id: 'animation_controls', value: Global.state.animationController});
	});

	Emitter.on(ANIMATION_CONTROLS_EVENTS.REQUEST_DELETE, () => {
		state.deleteRecord({id: 'animation_controls'});
	});

	Emitter.on(ANIMATION_CONTROLS_EVENTS.REQUEST_LOAD, async() => {
		/**
		 * @type {AnimationControllerGlobalData}
		 */
		const settings = await state.getRecord({id: 'animation_controls'});

		if (settings) {
			Global.set_animation_controller(settings);
		}
		Emitter.emit(ANIMATION_CONTROLS_EVENTS.REQUEST_LOAD_COMPLETE);
	});

	// preview
	Emitter.on(PREVIEW_EVENTS.REQUEST_SAVE, () => {
		const data = Global.defaultPreview();
		// only save pan and zoom
		data.zoom = Global.state.preview.zoom;
		data.pan = Global.state.preview.pan;

		state.saveRecord({id: 'preview', value: data});
	});

	Emitter.on(PREVIEW_EVENTS.REQUEST_DELETE, () => {
		state.deleteRecord({id: 'preview'});
		Emitter.emit(PREVIEW_EVENTS.UPDATE_SETTINGS);
	});

	Emitter.on(PREVIEW_EVENTS.REQUEST_LOAD, async() => {
		/**
		 * @type {PreviewGlobalData}
		 */
		const settings = await state.getRecord({id: 'preview'});

		if (settings) {
			Global.set_preview(settings);
			Emitter.emit(PREVIEW_EVENTS.UPDATE_SETTINGS);
		}
		Emitter.emit(PREVIEW_EVENTS.REQUEST_LOAD_COMPLETE);
	});

	// menu-alignment
	Emitter.on(MENU_EVENTS.REQUEST_SAVE_ALIGNMENT, () => {
		state.saveRecord({id: 'menu_window_alignment', value: Global.state.menuWindowAlignment});
	});

	Emitter.on(MENU_EVENTS.REQUEST_DELETE_ALIGNMENT, () => {
		state.deleteRecord({id: 'menu_window_alignment'});
	});

	Emitter.on(MENU_EVENTS.REQUEST_LOAD_ALIGNMENT, async() => {
		/**
		 * @type {MenuWindowAlignmentGlobalData}
		 */
		const settings = await state.getRecord({id: 'menu_window_alignment'});

		if (settings) {
			Global.set_menu_window_alignment(settings);
		}
		Emitter.emit(MENU_EVENTS.REQUEST_LOAD_ALIGNMENT_COMPLETE);
	});


	state.updateImage((e, imgSrc) => {
		Emitter.emit(UPLOADER_EVENTS.UPDATE_IMAGE, imgSrc);
	});

	state.error((_, message) => {
		ErrorPopup({ text: message });
	});

	state.exportProgress((_, message) => {
		ExportProgressPopup({ text: message });
	});

	state.exportCompleted((_, message) => {
		ExportCompletedPopup({ text: message });
	});

	// two-way communication
	state.exportOverwriteAsk((_, message) => {
		WarningPopup({
			text: message,
			onAccept: () => {
				state.exportOverwriteReply(true);
			},
			onDecline: () => {
				state.exportOverwriteReply(false);
			}
		});
	});

	async function invokePackageJSON() {
		/**
		 * @type {TAppInfo}
		 */
		const result = await state.packageJSON();
		Emitter.emit(GENERAL_EVENTS.SEND_PACKAGE_JSON, result);
	}

	/**
	 * @param {TExportPngSequencesPayload} payload
	 */
	async function invokeSavePngSequences(payload) {
		state.savePngSequences(payload);
	}

	/**
	 * @param {TExportGifPayload} payload
	 */
	async function invokeSaveGif(payload) {
		const result = await state.saveGif(payload);

		if (result && result.error === ERROE_CODE.FFMPEG_MISSING) {
			WarningPopup({ text: getLocale()['warn.ffmpeg.missing'] });
		}
	}

	/**
	 * @param {TExportSpriteSheetPayload} payload
	 */
	async function invokeSaveSpriteSheet(payload) {
		const result = await state.saveSpriteSheet(payload);

		if (result && result.error === ERROE_CODE.FFMPEG_MISSING) {
			WarningPopup({ text: getLocale()['warn.ffmpeg.missing'] });
		}
	}
}
