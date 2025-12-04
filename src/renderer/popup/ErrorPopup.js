import { getDivElementById } from '@renderer/utils';

import { BasePopup } from './BasePopup';

/**
 * @param {ErrorPopupProps} props
 */
export function ErrorPopup(props) {
	const basePopup = BasePopup();

	function destroy() {
		basePopup.destroy();
	}

	open();

	/**
	 * @param {string} text
	 * @returns {string}
	 */
	function create(text='') {
		return `
			<div class="popup-contents notify-popup error-popup">
				<div class="popup-text">${text}</div>

				<div class="popup-buttons">
					<button type="button" id="popup-warning-ok-button">Ok</button>
				</div>
			</div>
		`;
	}

	function open() {
		destroy();
		const popup = create(props.text);

		basePopup.create(popup);
		basePopup.showBg(true);

		const okBtn = getDivElementById('popup-warning-ok-button');

		okBtn.onclick = () => {
			if (props.onAccept) {
				props.onAccept();
			}
			destroy();
		};
	}
}
