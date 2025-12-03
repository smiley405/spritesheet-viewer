import { Emitter } from './Emitter';
import { GENERAL_EVENTS } from './events/GeneralEvents';
import { FileHeader } from './FileHeader';
import { FramesCollection } from './frames/FramesCollection';
import { PreviewFrames } from './frames/PreviewFrames';
import { Global } from './Global';
import { GridHitBoxes } from './grid/GridHitBoxes';
import { Grids } from './grid/Grids';
import { Menu } from './menu/Menu';
import { HelpPopup } from './popup/HelpPopup';
import { PreloaderPopup } from './popup/PreloaderPopup';
import { UploadPopup } from './popup/UploadPopup';
import { IPCRenderer } from './renderer';
import { Resizer } from './Resizer';
import { DropFiles } from './uploader/DropFiles';
import { Viewport } from './Viewport';

window.onload = ()=> {
	IPCRenderer();

	Global.set_keyboard({
		left: 37,
		right: 39,
		shift: 16,
		ctrl: 17,
		alt: 18,
		space: 32,
		z: 90,
		q: 81
	});

	Emitter.on(GENERAL_EVENTS.SEND_PACKAGE_JSON, (/** @type {TAppInfo} */ payload) => {
		Global.set_app_info(payload);
	});

	Emitter.emit(GENERAL_EVENTS.REQUEST_PACKAGE_JSON);

	// Menu

	FileHeader();

	// grids
	Grids();
	GridHitBoxes();

	// popup
	PreloaderPopup();
	UploadPopup();
	HelpPopup();

	// uploader
	DropFiles();

	Viewport(); 

	// frames
	FramesCollection();
	PreviewFrames();

	Menu();

	Resizer();
};
