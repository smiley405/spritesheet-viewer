import { getDivElementById } from '@renderer/utils';

export function BasePopup() {
	const popupDiv = getDivElementById('popup');
	const popupBgDiv = getDivElementById('popup-bg');

	showBg(false);

	function showBg(enable=true) {
		popupBgDiv.style.display = enable ? 'block' : 'none';
	}

	function destroy() {
		popupDiv.innerHTML = '';
		showBg(false);
	}

	/**
	 * @param {string} ele
	 * @returns {void}
	 */
	function create(ele) {
		popupDiv.innerHTML = ele;
	}

	return {
		showBg,
		destroy,
		create
	};
}
