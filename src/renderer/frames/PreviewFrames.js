import { Emitter } from '@renderer/Emitter';
import { GRID_EVENTS } from '@renderer/events/GridEvents';
import { PREVIEW_EVENTS } from '@renderer/events/PreviewEvents';
import { SETTINGS_EVENTS } from '@renderer/events/SettingsEvents';
import { UPLOADER_EVENTS } from '@renderer/events/UploaderEvents';
import { VIEWPORT_EVENTS } from '@renderer/events/ViewportEvents';
import { Global } from '@renderer/Global';
import { createPanzoom, getDivElementById } from '@renderer/utils';

import { FRAMES_EVENTS } from '../events/FramesEvents';

/**
 * @typedef {import('@renderer/grid/GridHitBoxes').THitBox} TFrame
 */

export function PreviewFrames() {
	const previewDiv = getDivElementById('preview');
	const panzoom = createPanzoom(previewDiv);

	/**
	 * @type {Map<string, TFrame>}
	 */
	let frames = new Map();
	/**
	 * @type {HTMLImageElement}
	 */
	let cachedViewportImage;
	/**
	 * @type {HTMLCanvasElement}
	 */
	let canvas = document.createElement('canvas');
	canvas.setAttribute('id', 'preview-frames-canvas');
	/**
	 * @type {CanvasRenderingContext2D}
	 */
	let ctx = canvas.getContext('2d');
	let isMouseOver = false;
	let isDecFrame = false;
	let isIncFrame = false;
	let currentFrameIndex = 0;
	let accumulator = 0;
	let playing = true;
	let currentFrame = null;

	canvas.setAttribute('class', 'preview-frame-image');
	previewDiv.appendChild(canvas);

	Emitter.on(FRAMES_EVENTS.CLICK, onClickFrame.bind(this));
	Emitter.on(FRAMES_EVENTS.CLEAR, onClearFrames.bind(this));
	Emitter.on(FRAMES_EVENTS.RESTART, onRestartFrames.bind(this));
	Emitter.on(UPLOADER_EVENTS.IMAGE_LOADED, onImageLoaded.bind(this));
	Emitter.on(SETTINGS_EVENTS.UPDATE, onUpdateSettings.bind(this));
	Emitter.on(PREVIEW_EVENTS.UPDATE_ZOOM, onUpdateZoom.bind(this));
	Emitter.on(PREVIEW_EVENTS.UPDATE_PAN, onUpdatePan.bind(this));

	Emitter.on(GRID_EVENTS.SELECT_AREA, onSelectGridArea.bind(this));
	Emitter.on(GRID_EVENTS.DESELECT_AREA, onDeselectGridArea.bind(this));
	Emitter.on(GRID_EVENTS.DESTROY, destroy.bind(this));
	Emitter.on(VIEWPORT_EVENTS.CREATED, onCreateViewport.bind(this));

	Global.ticker.add('update', update.bind(this));
	Global.ticker.add('render', render.bind(this));

	setTimeout(() => panzoom.pan(Global.defaultPreview().pan.x, Global.defaultPreview().pan.y));

	previewDiv.addEventListener('mouseover', ()=> {
		isMouseOver = true;
	});
	previewDiv.addEventListener('mouseleave', ()=> {
		isMouseOver = false;
	});
	previewDiv.addEventListener('wheel', e=> {
		if (isMouseOver) {
			panzoom.zoomWithWheel(e);
		}
	});

	previewDiv.onmousedown = () => {
		previewDiv.classList.add('active');
		previewDiv.classList.remove('inactive');
	};

	previewDiv.onmouseup = () => {
		previewDiv.classList.remove('active');
		previewDiv.classList.add('inactive');
	};

	onUpdateSettings();

	function render() {
		ctx.setTransform(1,0,0,1,0,0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (!frames.size) {
			return;
		}

		currentFrame = [...frames.values()][currentFrameIndex];

		ctx.drawImage(cachedViewportImage, currentFrame.x, currentFrame.y, currentFrame.width, currentFrame.height, 0, 0, currentFrame.width, currentFrame.height);

		Emitter.emit(FRAMES_EVENTS.UPDATE, /** @type {import('../events/FramesEvents').UpdateFrameData} */ ({ activeFrameIndex: currentFrameIndex, id: currentFrame.id }));
	} 

	/**
	 * @param {number} dt 
	 */
	function update(dt) {
		updateProps();

		if (!frames.size || !playing) {
			return;
		}

		if (!loop() && currentFrameIndex == frames.size - 1) {
			self.stop();
			return;
		}

		accumulator += dt;

		while(accumulator * fps() >= 1) {
			currentFrameIndex = ++currentFrameIndex % frames.size;
			accumulator -= 1 / fps();

			Global.set_preview({ activeFrameIndex: currentFrameIndex });
		}
	}

	function start(frameIndex = 0) {
		if (!playing) {
			resetAnimation();
			setCurrentFrameIndex(frameIndex);
			playing = true;
		}
	}

	/**
	 * @param {number} [ frameIndex ] 
	 */
	function stop(frameIndex) {
		setCurrentFrameIndex(frameIndex);
		playing = false;
	}

	/**
	 * @param {number} frameIndex
	 */
	function setCurrentFrameIndex(frameIndex) {
		currentFrameIndex = frameIndex !== undefined ? frameIndex : currentFrameIndex;
	}

	function resetAnimation() {
		stop();
		playing = false;
		currentFrameIndex = 0;
		currentFrame = null;
		accumulator = 0;
	}

	function updateProps() {
		Global.set_preview({ zoom: panzoom.getScale(), pan: panzoom.getPan()});

		if (!Global.state.animationController.play) {
			updateKeyboardInput();
			stop();
			return;
		} else {
			if (frames.size) {
				start(currentFrameIndex);
			}
		}

		if (!playing && Global.state.animationController.play) {
			playing = true;
		}

		if (Global.state.animationController.frameRate !== fps()) {
			stop();
		}

	}

	/**
	 * @param {import('@renderer/events/ViewportEvents').CreateViewportData} data
	 */
	function onCreateViewport(data) {
		cachedViewportImage = data.cachedImage;
	}

	function fps() {
		return Global.state.animationController.frameRate;
	}

	function loop() {
		return Global.state.animationController.loop;
	}

	/**
	 * @param {import("../events/GridEvents").SelectGridArea} data
	 */
	async function onSelectGridArea(data) {
		canvas.width = data.width;
		canvas.height = data.height;

		frames.set(data.id, data);
		Global.set_preview({
			totalFrames: frames.size
		});
	}

	/**
	 * @param {import("../events/GridEvents").DeselectGridArea} id
	 */
	function onDeselectGridArea({ id }) {
		frames.delete(id);
		if (currentFrameIndex >= frames.size) {
			currentFrameIndex = 0;
		}

		Global.set_preview({
			totalFrames: frames.size
		});
	}

	function updateKeyboardInput() {
		if (!frames.size) {
			return;
		}

		if (Global.keyboard('left').isDown && !isDecFrame) {
			isDecFrame = true;
			currentFrameIndex -=1;
			if (currentFrameIndex <= -1) {
				currentFrameIndex = frames.size - 1;
			}

			Global.set_preview({ activeFrameIndex: currentFrameIndex });
		}

		if (Global.keyboard('right').isDown && !isIncFrame) {
			isIncFrame = true;
			currentFrameIndex +=1;
			if (currentFrameIndex >= frames.size) {
				currentFrameIndex = 0;
			}

			Global.set_preview({ activeFrameIndex: currentFrameIndex });
		}

		if (Global.keyboard('left').isUp && isDecFrame) {
			isDecFrame = false;
		}

		if (Global.keyboard('right').isUp && isIncFrame) {
			isIncFrame = false;
		}

	}

	function destroy() {
		onClearFrames();
		resetAnimation();
	}

	function onRestartFrames() {
		setCurrentFrameIndex(Global.state.preview.activeFrameIndex);
		render();
	}

	function onClearFrames() {
		resetAnimation();

		frames.clear();
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		isMouseOver = false;
		isDecFrame = false;
		isIncFrame = false;
		Global.set_preview({
			totalFrames: Global.defaultPreview().totalFrames,
			activeFrameIndex: Global.defaultPreview().activeFrameIndex
		});
	}

	/**
	 * @param {import("../events/FramesEvents").ClickFrameData} data
	 */
	function onClickFrame(data) {
		stop();
		start(data.index);
	}

	function onImageLoaded() {
		onClearFrames();

		if (Global.state.remember.preview) {
			panzoom.zoom(Global.state.preview.zoom);
			panzoom.pan(Global.state.preview.pan.x, Global.state.preview.pan.y);
		} else {
			panzoom.zoom(Global.defaultPreview().zoom);
			panzoom.pan(Global.defaultPreview().pan.x, Global.defaultPreview().pan.y);
		}
	}

	function onUpdateSettings() {
		previewDiv.style.backgroundColor = Global.state.settings.preview.backgroundColor;

		if (Global.state.settings.rendering.pixelated) {
			previewDiv.classList.add('pixel-rendering');
		} else {
			previewDiv.classList.remove('pixel-rendering');
		}
	}

	/**
	 * @param {number} zoom
	 */
	function onUpdateZoom(zoom) {
		panzoom.zoom(zoom > panzoom.getOptions().maxScale ? panzoom.getOptions().maxScale : zoom);
	}

	/**
	 * @param {import('@renderer/Global').PanGlobalData} pan
	 */
	function onUpdatePan(pan) {
		panzoom.pan(pan.x ?? panzoom.getPan().x, pan.y ?? panzoom.getPan().y);
	}
}
