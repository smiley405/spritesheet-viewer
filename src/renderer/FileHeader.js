import { Emitter } from './Emitter';
import { FILE_HEADER_EVENTS } from './events/FileHeaderEvents';
import { VIEWPORT_EVENTS } from './events/ViewportEvents';
import { Global } from './Global';
import { getDivElementById } from './utils';

export function FileHeader() {
	const div = getDivElementById('file-name-header');

	Emitter.on(FILE_HEADER_EVENTS.UPDATE, update.bind(this));
	Emitter.on(VIEWPORT_EVENTS.CREATED, onViewportCreated.bind(this));

	function onViewportCreated() {
		const newFileName = `${Global.state.image.currentFileName} [ ${Global.state.image.width} x ${Global.state.image.height} ]`;
		update(newFileName);
	}

	/**
	 * @param {string} name
	 */
	function update(name) {
		div.innerHTML = name;
		div.style.display = name ? 'block' : 'none';
	}
}
