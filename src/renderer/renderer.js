import { ERROE_CODE } from './const';
import { Emitter } from './Emitter';
import { GENERAL_EVENTS } from './events/GeneralEvents';
import { MENU_EVENTS } from './events/MenuEvents';
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

	Emitter.on(SETTINGS_EVENTS.REQUEST_SAVE, () => {
		state.saveRecord({id: 'settings', value: Global.state.settings});
	});

	Emitter.on(SETTINGS_EVENTS.REQUEST_DELETE, () => {
		state.deleteRecord({id: 'settings'});
	});

	Emitter.on(SETTINGS_EVENTS.REQUEST_LOAD, async() => {
		/**
		 * @type {import('./Global').SettingsGlobalData}
		 */
		const settings = await state.getRecord({id: 'settings'});

		if (settings) {
			Global.set_settings(settings);
			Emitter.emit(SETTINGS_EVENTS.UPDATE);
		}
		Emitter.emit(SETTINGS_EVENTS.REQUEST_LOAD_COMPLETE);
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
