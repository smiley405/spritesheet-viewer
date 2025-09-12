import { BasePopup } from './BasePopup';

/**
 * @typedef {object} ExportProgressPopupProps
 * @property {string} text
 */

/**
 * @param {ExportProgressPopupProps} props
 */
export function ExportProgressPopup(props) {
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
			<div class="popup-contents notify-popup">
				<div class="popup-text">${text}</div>
			</div>
		`;
	}

	function open() {
		destroy();
		const popup = create(props.text);

		basePopup.create(popup);
		basePopup.showBg(true);
	}
}
