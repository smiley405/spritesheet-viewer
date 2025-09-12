import { getDivElementById } from '@renderer/utils';

import { BaseUpload } from './BaseUpload';

export function FileUploader() {
	const {validateFilesLength, readFile} = BaseUpload();
	let uploaderDiv = getDivElementById('menu-upload-input');

	uploaderDiv.onchange = (e) => { 
		const target = /** @type {HTMLInputElement} */(e.target);
		const files = target.files;

		if (!validateFilesLength(files.length)) {
			return;
		}

		handleFiles(files);
	};

	/** 
	 * @param {FileList} files
	 */
	function handleFiles(files) {
		const _files = [...files];
		_files.forEach(file => {
			readFile(file);
		});
	}
}
