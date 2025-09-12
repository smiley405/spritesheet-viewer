/**
 * @typedef {'left'|'right'|'shift'|'ctrl'|'alt'|'z'|'q'|'space'} keysId
 */

/**
 * @typedef {{[id:string]: keyData}} keys
 */

/**
 * @typedef {{[id: string]: number}} keyCodes
 */

/**
 * @typedef {{code: number, isDown: boolean, isUp: boolean, press?: Function, release?: Function, downHandler: KeyHandler, upHandler: KeyHandler}} keyData
 */

/**
 * @typedef {(event: KeyboardEvent) => void} KeyHandler
 */

/**
 * @typedef {(keyId: string) => keyData} FGetKey
 */

/**
 * @typedef {{getKey: FGetKey}} KeyboardReturns
 */

/**
 * @callback KeyboardFn
 * @param {keyCodes} keyCodes
 * @returns {KeyboardReturns}
 */

/**
 * @type {KeyboardFn}
 */
export function Keyboard(keyCodes) {
	/**
	 * @type {keys}
	 */
	const keys = {};

	for (var id in keyCodes) {
		keys[id] = createKey(keyCodes[id]);
	}

	/**
	 * @param {number} keyCode
	 * @returns {keyData}
	 */
	function createKey(keyCode) {
		/**
		 * @type {keyData}
		 */
		const key = {};
		key.code = keyCode;
		key.isDown = false;
		key.isUp = true;

		/**
		 * @type {KeyHandler}
		 */
		key.downHandler = (event) => {
			if (event.keyCode === key.code) {
				if (key.isUp && key.press) key.press();
				key.isDown = true;
				key.isUp = false;
				// event.preventDefault();
			}
		};

		key.upHandler = (event) => {
			if (event.keyCode === key.code) {
				if (key.isDown && key.release) key.release();
				key.isDown = false;
				key.isUp = true;
				// event.preventDefault();
			}
		};

		window.addEventListener('keydown', key.downHandler.bind(key), false);
		window.addEventListener('keyup', key.upHandler.bind(key), false);

		return key;
	}

	return {
		getKey(keyId) {
			return keys[keyId];
		}
	};
}

