import { Emitter } from '@renderer/Emitter';
import { CLEAR_EVENTS } from '@renderer/events/ClearEvents';
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
	let gridWidth = Global.state.grid.layout.width;
	let gridHeight = Global.state.grid.layout.height;
	let gridDrawn = false;
	const containerDiv = getDivElementById('viewport');

	createCanvas();

	Emitter.on(GRID_EVENTS.CREATE, onCreateGrid.bind(this));
	Emitter.on(GRID_EVENTS.REMOVE, onRemoveGrid.bind(this));
	Emitter.on(CLEAR_EVENTS.CLEAR, onClear.bind(this));
	Emitter.on(VIEWPORT_EVENTS.CREATED, onViewportCreated.bind(this));
	Emitter.on(GRID_EVENTS.UPDATE_SETTINGS, onUpdateGridSettings.bind(this));

	function createCanvas() {
		canvas = document.createElement('canvas');
		canvas.setAttribute('id', 'grids-canvas');
		ctx = canvas.getContext('2d');
		containerDiv.appendChild(canvas);
	}

	function create(width=0, height=0, imageWidth=0, imageHeight=0) {
		const totalX = imageWidth / width;
		const totalY = imageHeight / height;
		gridWidth = width;
		gridHeight = height;
		gridDrawn = true;

		Global.set_grid_layout({totalX, totalY});

		destroy();
		updateGrid(imageWidth, imageHeight);

		Emitter.emit(GRID_EVENTS.CREATE_HIT_BOXES);
	}

	function updateGrid(imageWidth=0, imageHeight=0) {
		if (!gridDrawn) {
			return;
		}

		const scale = getCanvasScale();
		clearCanvas();

		// scaleup > draw grid and scale down to preserve the crispness relative to 1px-line thickness when zooming-in
		canvas.width = imageWidth * scale;
		canvas.height = imageHeight * scale;
		canvas.style.width = toPx(imageWidth);
		canvas.style.height = toPx(imageHeight);
		drawGrid(scale);
		canvas.style.opacity = String(Global.state.grid.appearance.opacity);
		canvas.style.display = Global.state.grid.appearance.visible ? 'block' : 'none';
	}

	function drawGrid(scale=1) {
		ctx.fillStyle = String(Global.state.grid.appearance.color);

		// vertical lines
		for (let i = 1; i < canvas.width; i ++) {
			if (i % (gridWidth * scale) == 0) {
				ctx.fillRect(i, 0, 1, canvas.height);
			}
		}

		// horizontal lines
		for (let j = 1; j < canvas.height; j ++) {
			if (j % (gridHeight * scale)== 0) {
				ctx.fillRect(0, j, canvas.width, 1);
			}
		}
	}

	function getCanvasScale() {
		// values from 0.1 to 1
		const lineThickness = Array.from({ length: 10 }, (_, i) => (i + 1)/10);
		// values from 10 to 1
		const scaleValues = Array.from({ length: 10 }, (_, i) => 10-(i * 1));
		const thicknessIndex = lineThickness.indexOf(Global.state.grid.appearance.lineThickness);
		const scale = scaleValues[thicknessIndex];
		return scale;
	}

	function clearCanvas() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	function destroy() {
		if (canvas && canvas.parentNode) {
			clearCanvas();
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
		Global.set_grid_appearance({ visible: false });
	}

	function onClear() {
		if (Global.state.clear.grid || Global.state.clear.viewport) {
			destroy();
		}
	}

	function onViewportCreated() {
		if (Global.state.grid.appearance.visible || Global.state.remember.grid) {
			onCreateGrid({width: Global.state.grid.layout.width, height: Global.state.grid.layout.height, imageWidth: Global.state.image.width, imageHeight: Global.state.image.height});
		}
	}

	function onUpdateGridSettings() {
		updateGrid(Global.state.image.width, Global.state.image.height);
	}
}
