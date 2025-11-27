import Panzoom from '@panzoom/panzoom';

import { Global } from './Global';

let _totalUID = 0;

export function getUID() {
	return _totalUID += 1;
}

/**
 * @param {number} value
 * @returns {string}
 */
export function toPx(value) {
	return value + 'px';
}

/**
 * copies object excluding functions
 * @template T
 * @param {T} data
 * @returns {T}
 */
export function copyObject(data) {
	return JSON.parse(JSON.stringify(data));
}

/**
 * will copy everything into the new object, including any functions.
 * @param {object} data
 * @returns {*}
 */
export function deepCloneObject(data) {
	return Object.assign({}, data);
}

/**
 * @param {boolean} isChecked
 * @returns {string}
 */
export function getChecked(isChecked) {
	return isChecked ? 'checked' : '';
}

export function isSelectionKeyDown() {
	return Global.keyboard('ctrl').isDown || Global.keyboard('shift').isDown || Global.keyboard('z').isDown;
}

/**
 * @param {HTMLElement} ele
 * @param {object} [ props ]
 * @param {HTMLElement} [ props.interactiveElement ]
 * @param {()=>void} [ props.onPointerDown ]
 * @param {()=>void} [ props.onPointerUp ]
 * @param {()=>void} [ props.onPointerMove ]
 * @returns {import("@panzoom/panzoom").PanzoomObject}
 */
export function createPanzoom(ele, props) {
	const panzoom = Panzoom(ele, { noBind: true });
	const nodeElement = props?.interactiveElement ?? ele;

	nodeElement.addEventListener('pointerdown', (e) => {
		if (props?.onPointerDown) {
			props.onPointerDown();
			return;
		}

		if (isSelectionKeyDown()) {
			return;
		}

		panzoom.handleDown(e);
	});
	document.addEventListener('pointermove', (e) => {
		if (props?.onPointerMove) {
			props.onPointerMove();
			return;
		}
		 panzoom.handleMove(e);
	});
	document.addEventListener('pointerup', (e) => {
		if (props?.onPointerUp) {
			props.onPointerUp();
			return;
		}

		if (isSelectionKeyDown()) {
			return;
		}

		panzoom.handleUp(e);
	});

	panzoom.setOptions({maxScale: 200});
	panzoom.setStyle('cursor', 'default');

	return panzoom;
}

/**
 * @param {string} id
 * @returns {HTMLDivElement}
 */
export function getDivElementById(id) {
	return /** @type {HTMLDivElement} */(document.getElementById(id));
}

/**
 * @param {string} id
 * @returns {HTMLButtonElement}
 */
export function getButtonElementById(id) {
	return /** @type {HTMLButtonElement} */(document.getElementById(id));
}

/**
 * @param {string} id
 * @returns {HTMLInputElement}
 */
export function getInputElementById(id) {
	return /** @type {HTMLInputElement} */(document.getElementById(id));
}

/**
 * @param {string} name
 * @returns {NodeListOf<HTMLInputElement>}
 */
export function getInputElementByName(name) {
	return /** @type {NodeListOf<HTMLInputElement>} */(document.getElementsByName(name));
}

/**
 * Convert frame duration in milliseconds to FPS (up to 2 decimal places)
 * @param {number} frameDurationMs - Duration of one frame in milliseconds
 * @returns {number} - Frames per second
 */
export function msToFPS(frameDurationMs) {
	if (frameDurationMs <= 0) return 0;

	const fps = 1000 / frameDurationMs;
	return Math.round(fps * 100) / 100; // round to 2 decimal places
}

/**
 * Convert FPS to frame duration in milliseconds (up to 2 decimal places)
 * @param {number} fps - Frames per second
 * @returns {number} - Duration of one frame in milliseconds
 */
export function fpsToMs(fps) {
	if (fps <= 0) return 0;

	const ms = 1000 / fps;
	return Math.round(ms * 100) / 100; // round to 2 decimal places
}

/**
 * rounds any number to a specified number of decimal places
 * - like 2 for rounding to the nearest hundredth (i.e., .00).
 * - formatValue(e.value);       // Default: 2 decimals
 * - formatValue(e.value, 3);   // 3 decimal places
 * - formatValue(e.value, 0);   // Rounded to integer
 * @param {number} value
 * @param {number} [ decimals ] - default to 2
 * @returns {number}
 */
export function formatValue(value, decimals = 2) {
	const factor = Math.pow(10, decimals);
	return Math.round(value * factor) / factor;
}

/**
 * @param {TRectBounds} r1
 * @param {TRectBounds} r2
 * @returns {boolean}
 */
export function hitTestRect(r1, r2) {
	var isInHoriztonalBounds = r1.x < r2.x + r2.width && r1.x + r1.width > r2.x;
	var isInVerticalBounds = r1.y < r2.y + r2.height && r1.y + r1.height > r2.y;

	return isInHoriztonalBounds && isInVerticalBounds;
}

/**
 * @param {TPoint} pt
 * @param {TRectBounds} rect
 * @returns {boolean}
 */
export function hitTestPoint(pt, rect) {
	// Get the position of the rect's edges
	const left = rect.x;
	const right = rect.x + rect.width;
	const top = rect.y;
	const bottom = rect.y + rect.height;

	// Find out if the point is intersecting the rectangle
	const hit = pt.x > left && pt.x < right && pt.y > top && pt.y < bottom;

	return hit;

}


/**
 * Truncate a number to a fixed number of decimal places (no rounding).
 * @param {number} num - The number to truncate.
 * @param {number} decimals - How many decimal places to keep.
 * @returns {number} The truncated number.
 */
export function truncateDecimals(num, decimals) {
	const factor = Math.pow(10, decimals);
	return Math.floor(num * factor) / factor;
}

/**
 * @param {string} hex - hex color format
 * @param {number} [alpha]
 * @example
 * hexToRgba('#454545', 0.4)
 * Output: "rgba(69, 69, 69, 0.4)"
 * @returns {string}
 */
export function hexToRgba(hex, alpha = 1) {
	// Remove leading "#" if present
	hex = hex.replace(/^#/, '');

	// Handle shorthand hex (#abc to #aabbcc)
	if (hex.length === 3) {
		hex = hex.split('').map(char => char + char).join('');
	}

	// Parse r, g, b values
	const bigint = parseInt(hex, 16);
	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;

	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
