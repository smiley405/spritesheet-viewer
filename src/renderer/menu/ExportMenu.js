import { Emitter } from '@renderer/Emitter';
import { GENERAL_EVENTS } from '@renderer/events/GeneralEvents';
import { Global } from '@renderer/Global';
import { getLocale } from '@renderer/locale';
import { WarningPopup } from '@renderer/popup/WarningPopup';
import { getDivElementById } from '@renderer/utils';

/**
 * @type {import('@renderer/types/menu.types').BaseMenu}
 */
export function ExportMenu({ pane, page }) {
	const state = Global.state;
	const locale = getLocale();

	const frames = getDivElementById('frames');
	const f = page;
	const self = {
		/**
		 * @type {ExportFileType}
		 */
		fileType: 'PNG Sequences',
		fileNameTags: '',
		tagList: {
			tag1: {name: locale['export.tag.gridWidth'], text: ',w{w}'},
			tag2: {name: locale['export.tag.gridHeight'], text: ',h{h}'},
			tag3: {name: locale['export.tag.frameRate'], text: ',fps{fps}'},
		},
		confirm: () => {
			pane.expanded = false;

			if (!frames.children.length) {
				pane.expanded = false;
				WarningPopup({ text: locale['warn.empty_frames'] });

				return;
			}

			const fileNameTags = (() => {
				const tags = self.fileNameTags
					.replaceAll(/\{\s*w\s*\}/g, String(state.grid.layout.width))
					.replaceAll(/\{\s*h\s*\}/g, String(state.grid.layout.height))
					.replaceAll(/\{\s*fps\s*\}/g, String(state.animationController.frameRate));
				return tags;
			})();

			if (state.exportData.isPNGSequences) {
				/**
				 * @type {TExportPngSequencesPayload}
				 */
				const exportPayload = {
					name: state.exportData.fileName,
					fileNameTags: '',
					images: []
				};

				for (let i = 0; i < frames.children.length; i++) {
					const canvas = /** @type {HTMLCanvasElement}*/(frames.children[i].children[0]);
					const src = canvas.toDataURL('image/png', 0.9);
					exportPayload.images.push(src);
				}

				Emitter.emit(GENERAL_EVENTS.SAVE_PNG_SEQUENCES, exportPayload);
			}

			if (state.exportData.isGIF) {
				/**
				 * @type {TExportGifPayload}
				 */
				const exportPayload = {
					name: state.exportData.fileName,
					width: state.grid.layout.width,
					height: state.grid.layout.height,
					duration: state.animationController.frameRate,
					fileNameTags,
					images: []
				};

				for (let i = 0; i < frames.children.length; i++) {
					const canvas = /** @type {HTMLCanvasElement}*/(frames.children[i].children[0]);
					const src = canvas.toDataURL('image/png', 0.9);
					exportPayload.images.push(src);
				}

				Emitter.emit(GENERAL_EVENTS.SAVE_GIF, exportPayload);
			}

			if (state.exportData.isSpriteSheet) {
				/**
				 * @type {TExportSpriteSheetPayload}
				 */
				const exportPayload = {
					name: state.exportData.fileName,
					padding: state.exportData.spriteSheetOptions.padding,
					algorithm: state.exportData.spriteSheetOptions.algorithm,
					fileNameTags,
					images: []
				};

				for (let i = 0; i < frames.children.length; i++) {
					const canvas = /** @type {HTMLCanvasElement}*/(frames.children[i].children[0]);
					const src = canvas.toDataURL('image/png', 0.9);
					exportPayload.images.push(src);
				}

				Emitter.emit(GENERAL_EVENTS.SAVE_SPRITE_SHEET, exportPayload);
			}
		},
	};

	f.addBinding(state.exportData, 'fileName' , {
		label: locale['export.file_name']
	});
	const fileNameTagsInput = f.addBinding(self, 'fileNameTags', {
		label: locale['export.file_name_tags']
	});

	// filename tags buttons
	const f1 = f.addFolder({
		title: locale['export.tag.list_title'],
		expanded: false
	});
	f1.addButton({
		title: self.tagList.tag1.name
	}).on('click', () => {
		self.fileNameTags += self.tagList.tag1.text;
		fileNameTagsInput.refresh();
	});
	f1.addButton({
		title: self.tagList.tag2.name
	}).on('click', () => {
		self.fileNameTags += self.tagList.tag2.text;
		fileNameTagsInput.refresh();
	});
	f1.addButton({
		title: self.tagList.tag3.name
	}).on('click', () => {
		self.fileNameTags += self.tagList.tag3.text;
		fileNameTagsInput.refresh();
	});

	const showTagList = () => {
		f1.hidden = false;
		fileNameTagsInput.hidden = false;
	};

	const hideTagList = () => {
		f1.hidden = true;
		fileNameTagsInput.hidden = true;
	};

	const fileTypeInput = f.addBinding(self, 'fileType', {
		label: locale['export.file_type'],
		// /** @type{import('./Global').ExportFileType[]} */
		options: {
			['PNG Sequences']:'PNG Sequences',
			['GIF']: 'GIF',
			['SpriteSheet']: 'SpriteSheet'
		}
	}).on('change', ({ /** @type {import('./Global').ExportFileType}*/value }) => {
		state.exportData.isPNGSequences = value === 'PNG Sequences';
		state.exportData.isGIF = value === 'GIF';
		state.exportData.isSpriteSheet = value === 'SpriteSheet';
		toggleSpriteSheetOptions();

		if (value === 'PNG Sequences') {
			hideTagList();
		} else {
			showTagList();
		}
	});

	if (fileTypeInput.controller.value.rawValue === 'PNG Sequences') {
		hideTagList();
	}

	// spritesheet options
	const f2 = f.addFolder({
		title: locale['export.spritesheet'],
	});
	f2.addBinding(state.exportData.spriteSheetOptions, 'algorithm', {
		label: locale['export.spritesheet_algorithm'],
		// /** @type{TSpriteSheetAlgorithm[]} */
		options: {
			['left-right']: 'left-right',
			['top-down']: 'top-down',
			['binary-tree']: 'binary-tree',
			['diagonal']: 'diagonal',
			['alt-diagonal']: 'alt-diagonal'
		}
	});

	f2.addBinding(state.exportData.spriteSheetOptions, 'padding', {
		label: locale['export.spritesheet_padding'],
		min: 0,
		max: 100,
		step: 1
	});

	f.addButton({
		title: locale['btn.confirm']
	}).on('click', self.confirm);

	toggleSpriteSheetOptions();

	function toggleSpriteSheetOptions() {
		if (!f2) {
			return;
		}
		if (state.exportData.isSpriteSheet) {
			f2.hidden = false;
		} else {
			f2.hidden = true;
		}
	}
}
