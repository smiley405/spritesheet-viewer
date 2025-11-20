/**
 * Args for GRID_EVENTS.CREATE
 * @typedef {{width: number, height: number, imageWidth: number, imageHeight: number}} CreateGridData
 */

/**
 * Args for GRID_EVENTS.SELECT_AREA
 * @typedef {{id: string, x: number, y: number, width: number, height: number}} SelectGridArea
 */

/**
 * Args for GRID_EVENTS.DESELECT_AREA
 * @typedef {{id: string}} DeselectGridArea
 */

export const GRID_EVENTS = {
	CREATE: 'GRID_EVENTS.CREATE',
	CREATE_HIT_BOXES: 'GRID_EVENTS.CREATE_HIT_BOXES',
	REMOVE: 'GRID_EVENTS.REMOVE',
	SELECT_AREA: 'GRID_EVENTS.SELECT_AREA',
	DESELECT_AREA: 'GRID_EVENTS.DESELECT_AREA',
	CLICK_AREA: 'GRID_EVENTS.CLICK_AREA',
	DESTROY: 'GRID_EVENTS.DESTROY',
};
