import { Emitter } from '@renderer/Emitter';
import { Global } from '@renderer/Global';
import { getLocale } from '@renderer/locale';
import { WarningPopup } from '@renderer/popup/WarningPopup';
import { getDivElementById, hitTestPoint, hitTestRect, toPx } from '@renderer/utils';

import { FRAMES_EVENTS } from '../events/FramesEvents';
import { GRID_EVENTS } from '../events/GridEvents';

/**
 * @typedef {object} HitBoxSharedData
 * @property {string} [ id ]
 * @property {number} [ x ]
 * @property {number} [ y ]
 * @property {number} [ gridWidth ]
 * @property {number} [ gridHeight ]
 * @property {() => void} [ click ]
 */

/**
 * @typedef {object} onClickHitBoxProps
 * @property {THitBox} hitBox
 */

/**
 * @callback TOnClickHitBox
 * @param {onClickHitBoxProps} props
 * @returns {void}
 */

/**
 * @typedef {{[id: string]: THitBox}} HitBoxes
 */

/**
 * @typedef {TRectBounds & {id: string, type?: string}} THitBox
 */

/**
 * @callback TRenderCallback
 * @param {CanvasRenderingContext2D} ctx
 * @returns {void}
 */

export function GridHitBoxes() {
	/**
	 * @type {HTMLCanvasElement}
	 */
	let canvas = null;
	/**
	 * @type {CanvasRenderingContext2D}
	 */
	let ctx = null;
	/**
	 * @type {Map<string,THitBox>}
	 */
	let hitBoxes = new Map();
	const rootDiv = getDivElementById('root');
	const containerDiv = getDivElementById('viewport');
	const popupDiv = getDivElementById('popup');
	const previewDiv = getDivElementById('preview');

	/**
	 * @type {Map<string, THitBox>}
	 */
	let selectedHitBoxes = new Map();
	/**
	 * @type {Map<string, TRenderCallback>}
	 */
	let renderList = new Map();
	/**
	 * @type {TRectBounds}
	 */
	let mouseRectBounds;
	let currentGrid = {
		width: Global.state.grid.layout.width,
		height: Global.state.grid.layout.height,
	};

	Emitter.on(FRAMES_EVENTS.CLICK, onClickFrame.bind(this));
	Emitter.on(FRAMES_EVENTS.CLEAR, onClearFrames.bind(this));
	Emitter.on(GRID_EVENTS.CREATE_HIT_BOXES, create.bind(this));
	Emitter.on(GRID_EVENTS.DESTROY, destroy.bind(this));
	Emitter.on(FRAMES_EVENTS.UPDATE, onUpdateFrame.bind(this));

	Global.ticker.add(() => {
		render();
	});

	interaction();

	createCanvas();

	function render() {
		ctx.setTransform(1,0,0,1,0,0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		renderList.values().forEach(callback => {
			callback(ctx);
		});
	}

	// https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
	const getCanvasMousePt = (/** @type {MouseEvent}*/e) => {
		const rect = canvas.getBoundingClientRect();
		const sx = canvas.width/rect.width;
		const sy = canvas.height/rect.height;
		return {
			x: (e.clientX - rect.left)*sx,
			y: (e.clientY - rect.top)*sy
		};
	};

	function createCanvas() {
		canvas = document.createElement('canvas');
		canvas.setAttribute('id', 'grid-hit-boxes-canvas');
		ctx = canvas.getContext('2d');
		containerDiv.appendChild(canvas);
	}

	function create() {
		if (isLoadExistingHitBoxes()) {
			selectedHitBoxes.values().forEach(hitBox => {
				selectHitBox(hitBox);
			});
		} else {
			destroy();

			const totalX = Global.state.grid.layout.totalX;
			const totalY = Global.state.grid.layout.totalY;
			const gridWidth = Global.state.grid.layout.width;
			const gridHeight = Global.state.grid.layout.height;

			// re-update prev grid dimensions
			Global.set_grid_layout({
				prevWidth: Global.state.grid.layout.width,
				prevHeight: Global.state.grid.layout.height,
			});

			canvas.width = Global.state.image.width;
			canvas.height = Global.state.image.height;

			for (let i = 0; i < totalY; i++) {
				for (let j = 0; j < totalX; j++) {
					const x = gridWidth * j;
					const y = gridHeight * i;
					const id = `${x},${y}`;

					hitBoxes.set(id, {
						id,
						type: 'hit-box',
						x,
						y,
						width: gridWidth,
						height: gridHeight
					});
				}
			}

			canvas.style.opacity = '0.5';
			ctx.drawImage(canvas, 0, 0);
		}
	}

	/**
	 * @param {THitBox} hitBox
	 * @returns {void}
	 */
	function selectHitBox(hitBox) {
		const x = hitBox.x;
		const y = hitBox.y;
		const width = hitBox.width;
		const height = hitBox.height;
		const id = hitBox.id;

		Emitter.emit(GRID_EVENTS.SELECT_AREA, /** @type {import("../events/GridEvents").SelectGridArea} */ ({
			id,
			x,
			y,
			width,
			height
		}));
		selectedHitBoxes.set(id, hitBox);

		resetHitBox(hitBox);
	}

	/**
	 * @param {THitBox} hitBox
	 * @returns {void}
	 */
	function deselectHitBox(hitBox) {
		const id = hitBox.id;
		// hitBox.style.opacity = '0';
		Emitter.emit(GRID_EVENTS.DESELECT_AREA, /** @type {import("../events/GridEvents").DeselectGridArea}*/ ({ id }));
		selectedHitBoxes.delete(id);
		renderList.delete(id);
	}

	/**
	 * @param {THitBox} hitBox
	 * @returns {void}
	 */
	function resetHitBox(hitBox) {
		renderList.set(hitBox.id, (ctx) => {
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(hitBox.x, hitBox.y, hitBox.width, hitBox.height);
		});
	}

	/**
	 * @param {THitBox} hitBox
	 * @returns {void}
	 */
	function targetHitBox(hitBox) {
		renderList.set(hitBox.id, (ctx) => {
			ctx.fillStyle = '#b3fbaf';
			ctx.fillRect(hitBox.x, hitBox.y, hitBox.width, hitBox.height);
		});
	}

	function destroy() {
		if (!isLoadExistingHitBoxes()) {
			onClearFrames();
			hitBoxes.clear();
		}
	}

	function onClearFrames() {
		if (canvas && canvas.parentNode) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
		selectedHitBoxes.clear();
		renderList.clear();
	}

	/**
	 * @param {string} id
	 * @returns {void}
	 */
	function showActiveHitBox(id) {
		selectedHitBoxes.values().forEach(hitBox => {
			if (hitBox.id === id) {
				targetHitBox(hitBox);
			} else {
				resetHitBox(hitBox);
			}
		});
	}

	/**
	 * @param {import("../events/FramesEvents").ClickFrameData} data
	 */
	function onClickFrame(data) {
		showActiveHitBox(data.id);
	}

	function isLoadExistingHitBoxes() {
		if (Global.didGridDimensionsChange()) {
			return false;
		}

		if (Global.state.remember.frames) {

			if (Global.state.remember.sameFileNameOnly && !Global.is_same_image_reloaded()) {
				return false;
			}

			let isAllow = true;

			const hbList = [...selectedHitBoxes.values()];

			for (let i=0; i < hbList.length; i++) {
				const hitBox = hbList[i];
				// check if the hitBox is valid inside viewport's dimension
				if (
					(hitBox.y + hitBox.height) > Global.state.image.height ||
					(hitBox.x + hitBox.width) > Global.state.image.width
				) {
					isAllow = false;
					break;
				}
			}

			if (!isAllow) {
				WarningPopup({ text: getLocale()['warn.cant_retain_frames'] });
			}
			return isAllow;
		} else {
			return false;
		}

	}

	/**
	 * @param {import("../events/FramesEvents").UpdateFrameData} data
	 */
	function onUpdateFrame(data) {
		showActiveHitBox(data.id);
	}

	function interaction() {
		// @see {https://yizhiyue.me/2020/09/06/resizable-div-box-with-mouse-dragging-support-using-vanilla-javascript-typescript}
		// @see {https://copyprogramming.com/howto/drawing-a-rectangle-with-mouse-click-and-drag}
		// @see {/home/rambo/Documents/workspace/js/js13kgames/template.bak/packages/inputs/src/MouseInput.js}

		const selectRectDiv = document.createElement('div'); 
		const isShowCanvasSelection = false;
		const isShowMouseRect = false;
		let mouseDown = false;
		let mouseDrag = false;
		let x1 = 0;
		let y1 = 0;
		let x2 = 0;
		let y2 = 0;

		let cx1 = 0;
		let cy1 = 0;
		let cx2 = 0;
		let cy2 = 0;

		function add() {
			rootDiv.insertBefore(selectRectDiv, previewDiv);
			selectRectDiv.style.position = 'absolute';
			selectRectDiv.style.display = 'block';
			selectRectDiv.style.width = toPx(0);
			selectRectDiv.style.height = toPx(0);
			selectRectDiv.style.left = toPx(x1);
			selectRectDiv.style.top = toPx(y1);
			selectRectDiv.style.backgroundColor = '#2e6281';
			selectRectDiv.style.opacity = '0.5';
		}

		function update() {
			// for div
			const l1 = Math.min(x1, x2);
			const r1 = Math.max(x1, x2);
			const t1 = Math.min(y1, y2);
			const b1 = Math.max(y1, y2);
			const h1 = b1 - t1;
			const w1 = r1 - l1;
			selectRectDiv.style.left = toPx(l1);
			selectRectDiv.style.top = toPx(t1);
			selectRectDiv.style.width = toPx(w1);
			selectRectDiv.style.height = toPx(h1);

			// for canvas
			const l2 = Math.min(cx1, cx2);
			const r2 = Math.max(cx1, cx2);
			const t2 = Math.min(cy1, cy2);
			const b2 = Math.max(cy1, cy2);
			const h2 = b2 - t2;
			const w2 = r2 - l2;
			mouseRectBounds = {
				x: l2,
				y: t2,
				width: w2,
				height: h2
			};

			if (isShowCanvasSelection) {
				renderList.set('u1', (ctx) => {
					ctx.fillStyle = '#ff0000';
					ctx.fillRect(l2, t2, w2, h2);
				});
			}

			if (mouseRectBounds.width >= 2) {
				mouseDrag = true;
			}
			if (mouseRectBounds.height >= 2) {
				mouseDrag = true;
			}
		}

		function remove() {
			if (!selectRectDiv.parentElement) {
				return;
			}

			rootDiv.removeChild(selectRectDiv);
		}

		/**
		 * @type {(e: MouseEvent) => {x: number, y: number} }
		 */
		const getMousePt = (e) => {
			const rect = rootDiv.getBoundingClientRect();
			const sx = rootDiv.offsetWidth / rect.width;
			const sy = rootDiv.offsetHeight / rect.height;
			return {
				x: (e.clientX - rect.left) * sx,
				y: (e.clientY - rect.top) * sy
			};
		};

		rootDiv.addEventListener('pointerdown', e => {
			const pt1 = getMousePt(e); 
			const pt2 = getCanvasMousePt(e); 

			if (!mouseDown) {
				mouseDown = true;
				x1 = pt1.x;
				y1 = pt1.y;

				cx1 = pt2.x;
				cy1 = pt2.y;

				if (!popupDiv.children.length && Global.keyboard('shift').isDown) {
					add();
				}

				const hb = [...hitBoxes.values()].filter(v => hitTestPoint(mouseRectBounds, v));

				if (hb.length) {
					if (Global.keyboard('ctrl').isDown) {
						hb.forEach(hitBox => {
							if (selectedHitBoxes.has(hitBox.id)) {
								deselectHitBox(hitBox);
							} else {
								selectHitBox(hitBox);
							}
						});
					} else {
						if (Global.keyboard('z').isDown) {
							hb.forEach(hitBox => {
								if (selectedHitBoxes.has(hitBox.id)) {
									showActiveHitBox(hitBox.id);
									Emitter.emit(GRID_EVENTS.CLICK_AREA, hitBox.id);
								}
							});
						}

					}
				}
			}
		});

		rootDiv.addEventListener('pointerup', ()=> {
			mouseDown = false;

			if (mouseDrag) {
				const hb = [...hitBoxes.values()].filter(v => hitTestRect(v, mouseRectBounds));

				if (hb.length && Global.keyboard('shift').isDown) {
					hb.forEach(hitBox => {
						if (selectedHitBoxes.has(hitBox.id)) {
							deselectHitBox(hitBox);
						} else {
							selectHitBox(hitBox);
						}
					});
				}

				mouseDrag = false;
			}
			remove();
		});

		rootDiv.addEventListener('pointermove', e => {
			const pt1 = getMousePt(e); 
			const pt2 = getCanvasMousePt(e); 

			x2 = pt1.x;
			y2 = pt1.y;

			cx2 = pt2.x;
			cy2 = pt2.y;

			if (!Global.keyboard('shift').isDown) {
				mouseRectBounds = {
					x: pt2.x,
					y: pt2.y,
					width: 1,
					height: 1
				};
				if (isShowMouseRect) {
					renderList.set('p1', (ctx) => {
						ctx.fillStyle = '#000000';
						ctx.fillRect(mouseRectBounds.x, mouseRectBounds.y, mouseRectBounds.width, mouseRectBounds.height);
					});
				}
			} else {
				if (mouseDown) {
					update();
				}
			}
		});

	}
}

