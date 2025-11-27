import { Emitter } from '@renderer/Emitter';
import { MENU_EVENTS } from '@renderer/events/MenuEvents';
import { Global } from '@renderer/Global';
import { getLocale } from '@renderer/locale';

import { BasePopup } from './BasePopup';

export function HelpPopup() {
	const basePopup = BasePopup();
	// const helpMenuBtn = document.getElementById('menu-help');

	// helpMenuBtn.onclick = () => {
	// 	destroy();
	// 	open();
	// };

	Emitter.on(MENU_EVENTS.HELP, open.bind(this));

	function destroy() {
		basePopup.destroy();
	}

	/**
	 * @param {string[]} list
	 * @returns {string}
	 */
	function create(list) {
		let rules = '';
		list.forEach(text => {
			rules += `<div class='popup-help-rules-text'>&#x2022; ${text}</div><br>`;
		});
		return `
			<div class="popup-contents" id="popup-help">
				<div id="popup-help-app-version">${Global.state.appInfo.name} ${Global.state.appInfo.version}</div>
				${rules}

				<div class="popup-buttons">
					<button type="button" id="help-ok-button">${getLocale()['btn.ok']}</button>
				</div>
			</div>
		`;
	}

	function open() {
		destroy();

		const menu = create([
			getLocale()['help.upload'],
			getLocale()['help.how_to_add_frames'],
			getLocale()['help.zoom'],
			getLocale()['help.pan'],
			getLocale()['help.remember'],
			getLocale()['help.toogle_play'],
			getLocale()['help.cycle_frames'],
			getLocale()['help.animate_preview_window'],
			getLocale()['help.export']
		]);
		basePopup.create(menu);
		basePopup.showBg(true);

		const okBtn = document.getElementById('help-ok-button');

		// helpMenuBtn.classList.add('menu-button-active');

		okBtn.onclick = () => {
			destroy();
		};
	}
}
