import { Emitter } from './Emitter';
import { CLEAR_EVENTS } from './events/ClearEvents';
import { SETTINGS_EVENTS } from './events/SettingsEvents';
import { UPLOADER_EVENTS } from './events/UploaderEvents';
import { VIEWPORT_EVENTS } from './events/ViewportEvents';
import { Global } from './Global';
import { createPanzoom, getDivElementById, toPx } from './utils';

export const DEFAULT_VIEWPORT_CANVAS_SCALE = 2;

export function Viewport() {
	/**
	 * @type {HTMLCanvasElement}
	 */
	let canvas = null;
	/**
	 * @type {CanvasRenderingContext2D}
	 */
	let ctx = null;
	const containerDiv = getDivElementById('viewport');
	const root = getDivElementById('root');
	const parentDiv = getDivElementById('viewport-container');

	const panzoom = createPanzoom(containerDiv, {interactiveElement: parentDiv});

	let isMouseOver = false;

	createCanvas();

	Emitter.on(UPLOADER_EVENTS.IMAGE_LOADED, onImageLoaded.bind(this));
	Emitter.on(CLEAR_EVENTS.CLEAR, onClear.bind(this));
	Emitter.on(SETTINGS_EVENTS.UPDATE, onUpdateSettings.bind(this));
	Emitter.on(VIEWPORT_EVENTS.UPDATE_ZOOM, onUpdateZoom.bind(this));
	Emitter.on(VIEWPORT_EVENTS.UPDATE_PAN, onUpdatePan.bind(this));

	parentDiv.addEventListener('mouseover', ()=> {
		isMouseOver = true;
	});
	parentDiv.addEventListener('mouseleave', ()=> {
		isMouseOver = false;
	});
	parentDiv.addEventListener('wheel', e=> {
		if (isMouseOver) {
			panzoom.zoomWithWheel(e);
		}
	});

	Global.ticker.add('update', tick.bind(this));

	function createCanvas() {
		canvas = document.createElement('canvas');
		canvas.setAttribute('id', 'viewport-canvas');
		ctx = canvas.getContext('2d');
		containerDiv.appendChild(canvas);
		containerDiv.insertBefore(canvas, containerDiv.childNodes[0]);
	}

	/**
	 * @param {string} src
	 * @param {boolean} isRender
	 */
	async function drawImage(src, isRender) {
		canvas.style.visibility = isRender ? 'visible' : 'hidden';

		const image = document.createElement('img');
		image.src = src;

		await image.decode();
		const imageWidth = image.width;
		const imageHeight = image.height;

		canvas.width = imageWidth;
		canvas.height = imageHeight;

		const z = 1;
		canvas.style.width = toPx(imageWidth*z);
		canvas.style.height = toPx(imageHeight*z);

		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

		Global.set_image({
			width: imageWidth,
			height: imageHeight,
			src: image.src
		});
		Emitter.emit(VIEWPORT_EVENTS.CREATED, { cachedImage: image });

		if (Global.is_apply_previous_viewport_settings()) {
			panzoom.zoom(Global.state.viewport.zoom);
			panzoom.pan(Global.state.viewport.pan.x, Global.state.viewport.pan.y);
		} else {
			const dw = root.offsetWidth / imageWidth;
			const dh = root.offsetHeight / imageHeight;
			const sw1 = imageWidth * dw;
			const sh1 = imageHeight * dw;
			const sw2 = imageWidth * dh;
			const sh2 = imageHeight * dh;

			panzoom.zoom(dw);
			centerViewport(sw1, sh1);

			if (sh1 > root.offsetHeight) {
				panzoom.zoom(dh);
				centerViewport(sw2, sh2);
			}
		}

	}

	function tick() {
		Global.set_viewport({ zoom: panzoom.getScale(), pan: panzoom.getPan()});
	}

	function destroy() {
		if (canvas && canvas.parentNode) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
	}

	/**
	 * @param {number} [ w ]
	 * @param {number} [ h ]
	 */
	function centerViewport(w, h) {
		const _w = w ?? containerDiv.offsetWidth;
		const _h = h ?? containerDiv.offsetHeight;
		const x = root.offsetWidth/2 - _w/2;
		const y = root.offsetHeight/2 - _h/2;
		panzoom.pan(x/panzoom.getScale(), y/panzoom.getScale());
	}

	/**
	 * @param {import("./events/UploaderEvents").ImageLoadedData} data
	 */
	function onImageLoaded(data) {
		destroy();
		drawImage(data.src, data.isRender);
	}

	function onClear() {
		if (Global.state.clear.viewport) {
			destroy();
		}
	}

	function onUpdateSettings() {
		getDivElementById('root').style.backgroundColor = Global.state.settings.viewport.backgroundColor;
		if (Global.state.settings.rendering.pixelated) {
			containerDiv.classList.add('pixel-rendering');
		} else {
			containerDiv.classList.remove('pixel-rendering');
		}
	}

	/**
	 * @param {number} zoom
	 */
	function onUpdateZoom(zoom) {
		panzoom.zoom(zoom > panzoom.getOptions().maxScale ? panzoom.getOptions().maxScale : zoom);
	}

	/**
	 * @param {import("./Global").PanGlobalData} pan
	 */
	function onUpdatePan(pan) {
		panzoom.pan(pan.x ?? panzoom.getPan().x, pan.y ?? panzoom.getPan().y);
	}
}
