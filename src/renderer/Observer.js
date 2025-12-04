import { Global } from './Global';
import { copyObject } from './utils';

/**
 * @template T
 * @param {T} state
 * @returns
 */
export function Store(state) {
	const obj = copyObject(state);

	const observers = {};

	Global.ticker.add(()=> {
		for (let key in observers) {
			if (obj[key] !== state[key]) {
				set(key, state[key]);
			}
		}
	});

	function set(name, val) {
		if (obj[name] !== undefined) {
			const o = observers[name];
			o.forEach(callback => {
				callback(obj[name], val);	
			});
			obj[name] = val;
		}
	}

	/**
	 * @type {StoreObserver}
	 */
	function observe(stateKey, callback) {
		const keys = stateKey.split('.');
		let _obj = obj;	
		keys.forEach(key => {
			_obj = _obj[key];
		});

		if (_obj === undefined) {
			console.error(`${stateKey} does not exist in the store's state!`);
		}
		observers[stateKey] = observers[stateKey] ?? [];
		observers[stateKey].push(callback);
		return observers[stateKey].length;
	}

	return {
		observe,
		state,
	};
}
