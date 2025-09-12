import { Emitter } from '@renderer/Emitter';
import { CLEAR_EVENTS } from '@renderer/events/ClearEvents';
import dragDropFiles from 'drag-and-drop-files';

import { UPLOADER_EVENTS } from '../events/UploaderEvents';
import { BaseUpload } from './BaseUpload';

export function DropFiles() {
	const {validateFilesLength, readFile, clearFileHeader, reupdateImage} = BaseUpload();

	dragDropFiles(document.body, async (/** @type {File[]}*/ files) => {
		/**
		 * @type {File}
		 */
		const file = files[0];

		if (!validateFilesLength(files.length)) {
			return;
		}

		readFile(file);
	});

	Emitter.on(CLEAR_EVENTS.CLEAR, clearFileHeader.bind(this));
	Emitter.on(UPLOADER_EVENTS.UPDATE_IMAGE, reupdateImage);
}

