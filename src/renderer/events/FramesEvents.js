/**
 * Args for FRAMES_EVENTS.CLICK
 * @typedef {{id: string, index: number}} ClickFrameData
 */

/**
 * Args for FRAMES_EVENTS.UPDATE
 * @typedef {{id?: string, index?: number}} UpdateFrameData
 */

/**
 * Args for FRAMES_EVENTS.ON_KEYBOARD_NEXT_FRAME
 * @typedef {{id: string}} OnKeyboardNextFrameData
 */

/**
 * Args for FRAMES_EVENTS.CREATE
 * @typedef {{id: string, index: number}} CreateFrameData
 */

export const FRAMES_EVENTS = {
	CREATE: 'FRAMES_EVENTS.CREATE',
	REMOVE: 'FRAMES_EVENTS.REMOVE',
	CLICK: 'FRAMES_EVENTS.CLICK',
	UPDATE: 'FRAMES_EVENTS.UPDATE',
	CLEAR: 'FRAMES_EVENTS.CLEAR'
};
