import { Emitter } from '@renderer/Emitter';
import { SETTINGS_EVENTS } from '@renderer/events/SettingsEvents';
import { Global } from '@renderer/Global';
import { getLocale } from '@renderer/locale';
import { truncateDecimals } from '@renderer/utils';

import { EditMode, ShowFolderNotification } from './MenuUtils';

// :root is the <html> element
const root = document.documentElement;

/**
 * @type {import('@renderer/types/menu.types').BaseMenu}
 */
export function InterfaceSettingsMenu({ page }) {
	const state = Global.state;
	const locale = getLocale();

	const f = page.addFolder({
		title: locale['interface_settings.title'],
		expanded: false
	});

	const editMode = EditMode(f, f.title);
	const folderNotification = ShowFolderNotification(f);

	const init = () => {
		// viewport
		const f1 = f.addFolder({
			title: locale['viewport.title'],
			expanded: false
		});
		const viewportBgColorInput = f1.addBinding(state.settings.viewport, 'backgroundColor', {
			label: locale['interface_settings.background_color']
		}).on('change', ()=> editMode.show());

		// preview
		const f2 = f.addFolder({
			title: locale['preview.title'],
			expanded: false
		});
		const previewBgColorInput = f2.addBinding(state.settings.preview, 'backgroundColor', {
			label: locale['interface_settings.background_color'],
		}).on('change', ()=> editMode.show());

		const previewBgOpacityInput = f2.addBinding(state.settings.preview, 'backgroundOpacity', {
			label: locale['interface_settings.background_opacity'],
			min: 0,
			max: 1,
			step:0.1
		}).on('change', (data)=> {
			state.settings.preview.backgroundOpacity = truncateDecimals(data.value, 1);
			editMode.show();
		});

		const previewBorderColorInput = f2.addBinding(state.settings.preview, 'borderColor', {
			label: locale['interface_settings.border_color'],
		}).on('change', ()=> editMode.show());

		const previewBorderWidthInput = f2.addBinding(state.settings.preview, 'borderWidth', {
			label: locale['interface_settings.border_width'],
			min: 0,
			max: 10,
			step:0.1
		}).on('change', (data)=> {
			state.settings.preview.borderWidth = truncateDecimals(data.value, 1);
			editMode.show();
		});

		// frames
		const f3 = f.addFolder({
			title: locale['frames.title'],
			expanded: false
		});
		const framesBgColorInput = f3.addBinding(state.settings.framesCollection, 'backgroundColor', {
			label: locale['interface_settings.background_color']
		}).on('change', ()=> editMode.show());

		// others
		const pixelatedInput = f.addBinding(state.settings.rendering, 'pixelated', {
			label: locale['interface_settings.rendering_pixelated']
		}).on('change', ()=> editMode.show());

		const themeInput = f.addBinding(state.settings, 'theme', {
			label: locale['interface_settings.theme'],
			/** @type{Record<UITheme, UITheme>}} */
			options: {
				Default: 'Default',
				Iceberg: 'Iceberg',
				Jetblack: 'Jetblack',
				Light: 'Light',
				Retro: 'Retro',
				Translucent: 'Translucent',
				Vivid: 'Vivid',
			},
		}).on('change', ({ /** @type {UITheme}*/value }) => {
			setMenuTheme(value);
		});

		// load default theme
		setMenuTheme(state.settings.theme);

		const refreshInputs = () => {
			viewportBgColorInput.refresh();
			previewBgColorInput.refresh();
			previewBgOpacityInput.refresh();
			previewBorderColorInput.refresh();
			previewBorderWidthInput.refresh();
			framesBgColorInput.refresh();
			pixelatedInput.refresh();
			themeInput.refresh();
		};

		const self = {
			reset: () => {
				const defaultValues = Global.defaultSettings();
				state.settings.viewport.backgroundColor = defaultValues.viewport.backgroundColor;
				state.settings.preview.backgroundColor = defaultValues.preview.backgroundColor;
				state.settings.preview.backgroundOpacity = defaultValues.preview.backgroundOpacity;
				state.settings.preview.borderColor = defaultValues.preview.borderColor;
				state.settings.preview.borderWidth = defaultValues.preview.borderWidth;
				state.settings.framesCollection.backgroundColor = defaultValues.framesCollection.backgroundColor;
				state.settings.rendering.pixelated = defaultValues.rendering.pixelated;
				state.settings.theme = defaultValues.theme;
				refreshInputs();
				self.ok();
				editMode.hide();
				Emitter.emit(SETTINGS_EVENTS.REQUEST_DELETE);
				folderNotification.show(locale['info.reset_applied']);
			},
			ok: () => {
				Emitter.emit(SETTINGS_EVENTS.UPDATE);
				folderNotification.show();
				editMode.hide();
			},
			save: () => {
				Emitter.emit(SETTINGS_EVENTS.REQUEST_SAVE);
				folderNotification.show(locale['info.settings_saved'], 'warn');
			},
		};

		/**
		 * @see https://github.com/tweakpane/plugin-essentials
		 */
		f.addBlade({
			view: 'buttongrid',
			size: [3, 1],
			cells: (x, y) => ({
				title: [
					[locale['btn.reset'], locale['btn.apply'], locale['btn.save']],
				][y][x],
			}),
			label: locale['info.actions'],
		}).on('click', (ev) => {
			// console.log(ev);
			const id = ev.index.toString();

			switch (id) {
			case '0,0':
				self.reset();
				break;
			case '1,0':
				self.ok();
				break;
			case '2,0':
				self.save();
				break;
			}
		});
	};

	Emitter.emit(SETTINGS_EVENTS.REQUEST_LOAD);
	Emitter.on(SETTINGS_EVENTS.REQUEST_LOAD_COMPLETE, init);
}

/**
 * @param {UITheme} theme
 * @returns {void}
 */
function setMenuTheme(theme) {
	/**
	 * @type {string[]}
	 */
	const preset = [
		'tweakpane-theme-iceberg',
		'tweakpane-theme-jetblack',
		'tweakpane-theme-light',
		'tweakpane-theme-retro',
		'tweakpane-theme-translucent',
		'tweakpane-theme-vivid',
	];

	let currentPreset = '';

	switch (theme) {
	case 'Iceberg':
		currentPreset = preset[0];
		break;
	case 'Jetblack':
		currentPreset = preset[1];
		break;
	case 'Light':
		currentPreset = preset[2];
		break;
	case 'Retro':
		currentPreset = preset[3];
		break;
	case 'Translucent':
		currentPreset = preset[4];
		break;
	case 'Vivid':
		currentPreset = preset[5];
		break;
	}

	preset.forEach(id => {
		if (root.classList.contains(id)) {
			root.classList.remove(id);
		}
	});

	if (currentPreset) {
		root.classList.add(currentPreset);
	}

}
