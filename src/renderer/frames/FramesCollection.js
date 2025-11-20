import { Emitter } from '@renderer/Emitter';
import { CLEAR_EVENTS } from '@renderer/events/ClearEvents';
import { FRAMES_EVENTS } from '@renderer/events/FramesEvents';
import { GRID_EVENTS } from '@renderer/events/GridEvents';
import { SETTINGS_EVENTS } from '@renderer/events/SettingsEvents';
import { UPLOADER_EVENTS } from '@renderer/events/UploaderEvents';
import { VIEWPORT_EVENTS } from '@renderer/events/ViewportEvents';
import { Global } from '@renderer/Global';
import { getDivElementById } from '@renderer/utils';

export function FramesCollection() {
	/**
	 * @type {Map<string, HTMLDivElement>}
	 */
	let selectedFrames = new Map();
	/**
	 * @type {HTMLImageElement}
	 */
	let cachedViewportImage;
	const isShowIndexNumber = true;
	const visible = true;
	const classList = 'frame';
	const div = getDivElementById('frames');
	const frames = div.children;
	let activeFrameIndex = Global.state.preview.activeFrameIndex;

	Emitter.on(CLEAR_EVENTS.CLEAR, onClear.bind(this));
	Emitter.on(GRID_EVENTS.CLICK_AREA, onClickGridArea.bind(this));
	Emitter.on(SETTINGS_EVENTS.UPDATE, onUpdateSettings.bind(this));
	Emitter.on(GRID_EVENTS.SELECT_AREA, onSelectGridArea.bind(this));
	Emitter.on(GRID_EVENTS.DESELECT_AREA, onDeselectGridArea.bind(this));
	Emitter.on(UPLOADER_EVENTS.IMAGE_LOADED, destroy.bind(this));
	Emitter.on(VIEWPORT_EVENTS.CREATED, onCreateViewport.bind(this));

	Global.ticker.add('update', tick.bind(this));

	/**
	 * @param {import('@renderer/events/ViewportEvents').CreateViewportData} data
	 */
	function onCreateViewport(data) {
		cachedViewportImage = data.cachedImage;
	}

	onUpdateSettings();

	/**
	 * @param {import("../events/GridEvents").SelectGridArea} data
	 */
	async function onSelectGridArea(data) {
		// Wait for image to load if it's not already
		await cachedViewportImage.decode();

		/**
		 * @type {HTMLCanvasElement}
		 */
		const canvas = document.createElement('canvas');
		/**
		 * @type {CanvasRenderingContext2D}
		 */
		const ctx = canvas.getContext('2d');
		canvas.width = data.width;
		canvas.height = data.height;
		ctx.drawImage(cachedViewportImage, data.x, data.y, data.width, data.height, 0, 0, data.width, data.height);

		const frame = document.createElement('div');
		const indexDev = document.createElement('div');
		indexDev.classList.add('frame-index-number');
		indexDev.innerHTML = String(div.children.length);

		frame.classList.add(classList);
		frame.appendChild(canvas);

		if (isShowIndexNumber) {
			frame.appendChild(indexDev);
		}

		div.appendChild(frame);
		selectedFrames.set(data.id, frame);

		if (!visible) {
			frame.style.display = 'none';
		}

		onCreateFrame({id: data.id, index: div.children.length-1});

		frame.onmousedown = ()=> {
			const index = getFrameIndex(frame);

			onClickFrame(data.id, index);
		};
	}

	/**
	 * @param {HTMLDivElement} frame
	 * @returns {number}
	 */
	function getFrameIndex(frame) {
		let index = 0;

		for (let i = 0; i < div.children.length; i++) {
			if (div.children[i] === frame) {
				index = i;
				break;
			}
		}
		return index;
	}

	/**
	 * @param {import("../events/GridEvents").DeselectGridArea} id
	 */
	function onDeselectGridArea({ id }) {
		const activeIndex = getFrameIndex(selectedFrames.get(id));

		let newId;
		const ids = selectedFrames.keys;

		for (let i = 0; i < ids.length; i++) {
			if (ids[i] === id && i) {
				newId = ids[i-1];
				break;
			}
		}

		let newIndex = activeIndex - 1;
		if (newIndex < 0) {
			newIndex = 0;
		}

		div.removeChild(selectedFrames.get(id));
		selectedFrames.delete(id);

		if (isShowIndexNumber) {
			// re-calculate and assign index frame number
			const frames = selectedFrames.values;

			for (let j = 0; j < frames.length; j++) {
				if (frames[j].children) {
					const indexDiv = /** @type {HTMLDivElement} */(frames[j].children[1]);
					indexDiv.innerHTML = String(j);
				}
			}
		}

		onDeselectFrame(newId, newIndex);
	}

	function clearFrames() {
		activeFrameIndex = Global.state.preview.activeFrameIndex;
		div.innerHTML = '';
		selectedFrames.clear();
	}

	function onClear() {
		if (Global.state.clear.frames || Global.state.clear.viewport) {
			clearFrames();
			Emitter.emit(FRAMES_EVENTS.CLEAR);
		}
	}

	/**
	 * @param {string} id
	 * @returns {HTMLDivElement}
	 */
	function getFrameImage(id) {
		return /** @type {HTMLDivElement} */(selectedFrames.get(id).children[0]);
	}

	function tick() {
		if (frames.length) {
			if (activeFrameIndex !== Global.state.preview.activeFrameIndex) {
				activeFrameIndex = Global.state.preview.activeFrameIndex;

				for (let i = 0; i < frames.length; i++) {
					frames[i].classList.remove('active');
					frames[i].classList.add('inactive');
				}

				if (frames[Global.state.preview.activeFrameIndex]) {
					frames[Global.state.preview.activeFrameIndex].classList.remove('inactive');
					frames[Global.state.preview.activeFrameIndex].classList.add('active');
				}
			}
		} else {
			activeFrameIndex = -1;
		}
	}

	function destroy() {
		clearFrames();
	}

	/**
	 * @param {string} id 
	 * @param {number} index 
	 */
	function onClickFrame(id, index) {
		Global.set_preview({activeFrameIndex: index});
		Emitter.emit(FRAMES_EVENTS.CLICK, {id, index});
	}

	/**
	 * @param {{id: string, index: number}} data 
	 */
	function onCreateFrame(data) {
		const img = getFrameImage(data.id);
		img.classList.add('frame-image');
		Emitter.emit(FRAMES_EVENTS.CREATE, /** @type {import("../events/FramesEvents").CreateFrameData} */ ({id: data.id, index: data.index} ));
		onClickFrame(data.id, data.index);
	}

	/**
	 * @param {string} newId
	 * @param {number} newIndex
	 */
	function onDeselectFrame(newId, newIndex) {
		Emitter.emit(FRAMES_EVENTS.REMOVE);
		onClickFrame(newId, newIndex);
	}

	/**
	 * @param {string} id
	 */
	function onClickGridArea(id) {
		if (frames.length) {
			const frame = selectedFrames.get(id);

			const index = getFrameIndex(frame);
			onClickFrame(id, index);
		}
	}

	function onUpdateSettings() {
		// bottom-bar
		div.parentElement.style.backgroundColor = Global.state.settings.framesCollection.backgroundColor;

		if (Global.state.settings.rendering.pixelated) {
			div.classList.add('pixel-rendering');
		} else {
			div.classList.remove('pixel-rendering');
		}
	}
}
