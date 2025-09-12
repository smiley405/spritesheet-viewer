import { Emitter } from '@renderer/Emitter';
import { UPLOADER_EVENTS } from '@renderer/events/UploaderEvents';
import { getLocale } from '@renderer/locale';

import { BasePopup } from './BasePopup';

export function PreloaderPopup() {
	const basePopup = BasePopup();

	Emitter.on(UPLOADER_EVENTS.PRELOAD, open.bind(this));
	Emitter.on(UPLOADER_EVENTS.IMAGE_LOADED, destroy.bind(this));

	function destroy() {
		basePopup.destroy();
	}

	function create() {
		return `
			<div class="popup-contents" id="popup-preloader">
				<div>${getLocale()['preloader.loading']}...</div>
			</div>
		`;
	}

	function open() {
		destroy();

		const menu = create();
		basePopup.create(menu);
		basePopup.showBg(true);
	}
}
