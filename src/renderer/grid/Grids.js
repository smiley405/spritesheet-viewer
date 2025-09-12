import { Emitter } from '@renderer/Emitter';
import { CLEAR_EVENTS } from '@renderer/events/ClearEvents';
import { SETTINGS_EVENTS } from '@renderer/events/SettingsEvents';
import { VIEWPORT_EVENTS } from '@renderer/events/ViewportEvents';
import { Global } from '@renderer/Global';
import { getDivElementById, toPx } from '@renderer/utils';

import { GRID_EVENTS } from '../events/GridEvents';

export function Grids() {
	/**
	 * @type {HTMLCanvasElement}
	 */
	let canvas = null;
	/**
	 * @type {CanvasRenderingContext2D}
	 */
	let ctx = null;
	let gridWidth = Global.state.grid.width;
	let gridHeight = Global.state.grid.height;

	const containerDiv = getDivElementById('viewport');

	createCanvas();

	Emitter.on(GRID_EVENTS.CREATE, onCreateGrid.bind(this));
	Emitter.on(GRID_EVENTS.REMOVE, onRemoveGrid.bind(this));
	Emitter.on(CLEAR_EVENTS.CLEAR, onClear.bind(this));
	Emitter.on(VIEWPORT_EVENTS.CREATED, onViewportCreated.bind(this));
	Emitter.on(SETTINGS_EVENTS.UPDATE, onSettingsUpdate.bind(this));

	function createCanvas() {
		canvas = document.createElement('canvas');
		canvas.setAttribute('id', 'grids-canvas');
		ctx = canvas.getContext('2d');
		containerDiv.appendChild(canvas);
	}

	function create(width=0, height=0, imageWidth=0, imageHeight=0) {
		const size = 1;
		const color = Global.state.grid.color;
		const totalX = imageWidth / width;
		const totalY = imageHeight / height;
		gridWidth = width;
		gridHeight = height;

		Global.set_grid({totalX, totalY});

		destroy();

		const z = 2;

		canvas.width = imageWidth*z;
		canvas.height = imageHeight*z;

		canvas.style.width = toPx(imageWidth/2);
		canvas.style.height = toPx(imageHeight/2);

		ctx.fillStyle = color;

		// vertical lines
		for (let i = 1; i < imageWidth*z; i ++) {
			if (i % (gridWidth*z) == 0) {
				ctx.fillRect(i - 1, 0, size, imageHeight*z);
			}
		}

		// horizontal lines
		for (let j = 1; j < imageHeight*z; j ++) {
			if (j % (gridWidth*z)== 0) {
				ctx.fillRect(0, j - 1, imageWidth*z, size);
			}
		}

		ctx.drawImage(canvas, 0, 0);
		// scale and center
		canvas.style.opacity = String(Global.state.grid.opacity);
		canvas.style.transform = 'scale(2)';
		canvas.style.transformOrigin = 'left top';

		Emitter.emit(GRID_EVENTS.CREATE_HIT_BOXES);
	}

	function destroy() {
		if (canvas && canvas.parentNode) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			Emitter.emit(GRID_EVENTS.DESTROY);
		}
	}

	/**
	 * @param {import("../events/GridEvents").CreateGridData} data
	 */
	function onCreateGrid(data) {
		create(data.width, data.height, data.imageWidth, data.imageHeight);
	}

	function onRemoveGrid() {
		destroy();
		Global.set_grid({isShow: false});
	}

	function onClear() {
		if (Global.state.clear.grid || Global.state.clear.viewport) {
			destroy();
		}
	}

	function onViewportCreated() {
		if (Global.state.grid.isShow || Global.state.remember.grid) {
			onCreateGrid({width: Global.state.grid.width, height: Global.state.grid.height, imageWidth: Global.state.image.width, imageHeight: Global.state.image.height});
		}
	}

	function onSettingsUpdate() {
		if (ctx && Global.state.grid.color) {
			ctx.fillStyle = Global.state.grid.color;
		}

		containerDiv.style.display = Global.state.grid.isShow ? 'block' : 'none';
	}
}
