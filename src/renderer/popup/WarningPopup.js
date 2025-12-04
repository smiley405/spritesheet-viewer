import { getDivElementById } from '@renderer/utils';

import { BasePopup } from './BasePopup';

/**
 * @param {WarningPopupProps} props
 */
export function WarningPopup(props) {
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
			<div class="popup-contents notify-popup warn-popup">
				<div class="popup-text">${text}</div>

				<div class="popup-buttons">
					<button type="button" id="popup-warning-cancel-button">Cancel</button>
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
		const cancelBtn = getDivElementById('popup-warning-cancel-button');

		if (!props.onDecline) {
			cancelBtn.remove();
		}

		cancelBtn.onclick = () => {
			if (props.onDecline) {
				props.onDecline();
			}
			destroy();
		};

		okBtn.onclick = () => {
			if (props.onAccept) {
				props.onAccept();
			}
			destroy();
		};
	}
}
