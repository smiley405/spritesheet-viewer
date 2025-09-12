import { Emitter } from '@renderer/Emitter';
import { FILE_HEADER_EVENTS } from '@renderer/events/FileHeaderEvents';
import { UPLOADER_EVENTS } from '@renderer/events/UploaderEvents';
import { Global } from '@renderer/Global';
import { getLocale } from '@renderer/locale';
import { WarningPopup } from '@renderer/popup/WarningPopup';

export function BaseUpload() {
	/**
	 * @param {string} name
	 */
	function updateFileHeader(name) {
		Emitter.emit(FILE_HEADER_EVENTS.UPDATE, name);
		Global.state.image.pervFileName = Global.state.image.currentFileName;
		Global.state.image.currentFileName = name;
	}

	/**
	 * @param {string | string[]} imgSrc - base64 image
	 */
	function reupdateImage(imgSrc) {
		updateFileHeader(Global.state.image.currentFileName);
		loadImage(imgSrc);
	}

	/**
	 * @param {string} fileType
	 * @returns {boolean}
	 */
	function validateFileType(fileType) {
		// TODO to support gif, extract all gif frames to png and import it
		// else, there might be blank frame if the gif contains more frames.
		// const isAllowFileType = Boolean(['image/png', 'image/jpeg'].filter(type => type === fileType).length);
		const isAllowFileType = Boolean(['image/png', 'image/jpeg', 'image/gif'].filter(type => type === fileType).length);
		if (!isAllowFileType) {
			WarningPopup({ text: `'${fileType}' ${getLocale()['warn.file_format_not_supported']}` });
		}
		return isAllowFileType;
	}

	/**
	 * @param {number} total
	 * @returns {boolean}
	 */
	function validateFilesLength(total) {
		const isAllow = Boolean(total === 1);
		if (!isAllow) {
			WarningPopup({text: getLocale()['warn.drop_single_file']});
		}
		return isAllow;
	}

	/**
	 * @param {File} file
	 * @param {VoidFunction} [ onFailedValidation ]
	 */
	function readFile(file, onFailedValidation) {
		if (!validateFileType(file.type)) {
			if (onFailedValidation) onFailedValidation();
			return;
		}

		Emitter.emit(UPLOADER_EVENTS.PRELOAD, file);

		updateFileHeader(file.name);

		const reader = new FileReader();

		reader.readAsDataURL(file);

		reader.onload = ()=> {
			const isRender = !file.type.includes('gif');
			loadImage(/** @type {string}*/ (reader.result), isRender);
		};
	}

	/**
	 * @param {string | string[]} imgSrc - base64 image
	 * @param {boolean} [ isRender ]
	 */
	async function loadImage(imgSrc, isRender=true) {
		const parseImage = (/** @type {string}*/src) => {
			const image = new Image();
			image.src = src;

			image.onload = ()=> {
				Emitter.emit(UPLOADER_EVENTS.IMAGE_LOADED, /** @type {import("../events/UploaderEvents").ImageLoadedData}*/ ({
					image,
					src,
					isRender
				}));
			};
		};

		if (Array.isArray(imgSrc)) {
			// merge gif-frames i.e pngs to one single png
			const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d');
			const w = Global.state.image.width;
			const h = Global.state.image.height;
			canvas.width = w;
			canvas.height = h;

			const decodeImage = async () => {
				for (let i=0; i < imgSrc.length; i++ ) {
					const src = imgSrc[i];
					const img = new Image();
					img.src = src;

					// https://stackoverflow.com/questions/46399223/async-await-in-image-loading
					await img.decode();
					context.drawImage(img, 0, 0, w, h);
				}
			};

			await decodeImage();
			const url = canvas.toDataURL('image/png', 0.9);
			parseImage(url);
		} else {
			parseImage(/** @type {string}*/imgSrc);
		}
	}

	function clearFileHeader() {
		if (Global.state.clear.viewport) {
			updateFileHeader('');
		}
	}

	return {
		readFile,
		loadImage,
		reupdateImage,
		clearFileHeader,
		updateFileHeader,
		validateFileType,
		validateFilesLength
	};
}
