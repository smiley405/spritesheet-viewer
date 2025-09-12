/**
 * @callback FTicker
 * @param {FTickerProps} [props]
 * @returns {TTicker}
 */

/**
 * @typedef {object} TTicker
 * @property {FTickerAdd} add
 * @property {FTickerRemove} remove
 */

/**
 * @callback FTickerUpdate
 * @param {number} [dt]
 * @returns {void}
 */

/**
 * @callback FTickerAdd
 * @param {TTickerTypes} type
 * @param {FTickerUpdate} callback
 * @returns {number}
 */

/**
 * @callback FTickerRemove
 * @param {number} id
 * @param {TTickerTypes} type
 * @returns {void}
 */

/**
 * @typedef {'update' | 'render'} TTickerTypes
 */

/**
 * @typedef {object} FTickerProps
 * @property {number} [fps]
 */

/**
 * @typedef {{[id: string]: FTickerUpdate}} TTickerUpdaters
 */

/**
 * @typedef {{[id: string]: FTickerRender}} TTickerRenderers
 */

/**
 * @typedef {FTickerUpdate} FTickerRender
 */

/**
 * @type {FTicker}
 */
export function Ticker(props) {
	const fps = props && props.fps ? props.fps : 60;
	let startTime = performance.now();
	let accumulator = 0;
	let totalUpdatersUID = 0;
	let totalRenderersUID = 0;
	let delta = 1e3 / fps;
	let step = 1 / fps;
	let elapsed = 0;
	/**
	 * @type {TTickerUpdaters}
	 */
	let updaters = {};
	/**
	 * @type {TTickerRenderers}
	 */
	let renderers = {};

	tick();

	function tick() {
		requestAnimationFrame(tick);

		const current = performance.now();
		elapsed = current - startTime;
		startTime = current;

		if (elapsed > 1e3) {
			return;
		}

		accumulator += elapsed;

		while(accumulator >= delta) {
			update(step);
			accumulator -= delta;
		}
		render(step);
	}

	/**
	 * @type {FTickerUpdate}
	 */
	function update(dt) {
		for (let id in updaters) {
			updaters[id](dt);
		}
	}

	/**
	 * @type {FTickerRender}
	 */
	function render(dt) {
		for (let id in renderers) {
			renderers[id](dt);
		}
	}

	/**
	 * @type {FTickerAdd}
	 */
	function add(type, callback) {
		let total = type === 'update' ? totalUpdatersUID : totalRenderersUID; 

		const obj = type === 'update' ? updaters : renderers;

		total += 1;
		if (!obj[total]) {
			obj[total] = callback;
		}

		if (type === 'update') {
			totalUpdatersUID = total;
		} else {
			totalRenderersUID = total;
		}

		return total;
	}

	/**
	 * @type {FTickerRemove}
	 */
	function remove(id, type) {
		const obj = type === 'update' ? updaters : renderers;

		if (obj[id]) {
			delete obj[id];
		}
	}

	return {
		add,
		remove
	};
}

