import { Emitter } from '@renderer/Emitter';
import { VIEWPORT_EVENTS } from '@renderer/events/ViewportEvents';
import { Global } from '@renderer/Global';
import { getLocale } from '@renderer/locale';

/**
 * @type {import('@renderer/types/menu.types').BaseMenuReturnsUpdate}
 */
export function ViewportMenu({ page }) {
	const state = Global.state;
	const locale = getLocale();

	const f = page.addFolder({
		title: locale['viewport.title'],
		expanded: false
	});

	const pz = f.addBinding(state.viewport, 'zoom', {
		label: locale['viewport.zoom'],
		min: 0,
		// step: 0.1
	}).on('change', e => {
		Emitter.emit(VIEWPORT_EVENTS.UPDATE_ZOOM, e.value);
	});

	const px = f.addBinding(state.viewport.pan, 'x', {
		label: locale['viewport.x'],
		// step: 0.1,
	}).on('change', e => {
		Emitter.emit(VIEWPORT_EVENTS.UPDATE_PAN, {x: e.value});
	});

	const py = f.addBinding(state.viewport.pan, 'y', {
		label: locale['viewport.y']
		// step: 0.1,
	}).on('change', e => {
		Emitter.emit(VIEWPORT_EVENTS.UPDATE_PAN, {y: e.value});
	});

	const update = () => {
		pz.controller.value.setRawValue(state.viewport.zoom, {forceEmit: false, last: true});
		px.controller.value.setRawValue(state.viewport.pan.x, {forceEmit: false, last: true});
		py.controller.value.setRawValue(state.viewport.pan.y, {forceEmit: false, last: true});
	};

	return {update};
}

