import { Emitter } from '@renderer/Emitter';
import { MENU_EVENTS } from '@renderer/events/MenuEvents';
import { UPLOADER_EVENTS } from '@renderer/events/UploaderEvents';
import { getLocale } from '@renderer/locale';
import { FileUploader } from '@renderer/uploader/FileUploader';
import { getDivElementById } from '@renderer/utils';

import { BasePopup } from './BasePopup';

export function UploadPopup() {
	const basePopup = BasePopup();
	// const uploadBtn = getDivElementById('menu-upload');

	Emitter.on(MENU_EVENTS.LOAD, open.bind(this));
	Emitter.on(UPLOADER_EVENTS.IMAGE_LOADED, onImageLoaded.bind(this));

	// uploadBtn.onclick = () => {
	// 	destroy();
	// 	open();
	// };

	function destroy() {
		basePopup.destroy();
	}

	function create() {
		return `
			<div class="popup-contents" id="popup-upload">
				<input type="file" accept="image/*" class="menu" id="menu-upload-input">

				<div class="popup-buttons">
					<button type="button" id="upload-cancel-button">${getLocale()['btn.cancel']}</button>
				</div>
			</div>
		`;
	}

	function open() {
		destroy();

		const menu = create();
		basePopup.create(menu);
		basePopup.showBg(true);

		const cancelBtn = getDivElementById('upload-cancel-button');

		// uploadBtn.classList.add('menu-button-active');

		cancelBtn.onclick = () => {
			destroy();
		};

		FileUploader();
	}

	function onImageLoaded() {
		destroy();
	}
}
