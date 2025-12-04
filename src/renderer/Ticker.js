import { gsap } from 'gsap/all';

/**
 * @type {FTicker}
 */
export function Ticker() {
	let totalUpdatersUID = 0;
	/**
	 * @type {TTickerUpdaters}
	 */
	let updaters = {};

	gsap.ticker.add(tick);

	tick();

	function tick() {
		update();
	}

	/**
	 * @type {FTickerUpdate}
	 */
	function update() {
		for (let id in updaters) {
			updaters[id]();
		}
	}

	/**
	 * @type {FTickerAdd}
	 */
	function add(callback) {
		let total = totalUpdatersUID;
		total += 1;

		if (!updaters[total]) {
			updaters[total] = callback;
		}

		totalUpdatersUID = total;

		return total;
	}

	/**
	 * @type {FTickerRemove}
	 */
	function remove(id) {
		if (updaters[id]) {
			delete updaters[id];
		}
	}

	return {
		add,
		remove
	};
}

