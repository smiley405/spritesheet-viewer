import { Global } from '@renderer/Global';
import { getLocale } from '@renderer/locale';
import { toPx } from '@renderer/utils';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import {Pane} from 'tweakpane';

import { AlignToolMenu } from './AlignToolMenu';
import { AnimationControlsMenu } from './AnimationControlsMenu';
import { AnimationPreviewWindowMenu } from './AnimationPreviewWindowMenu';
import { ClearMenu } from './ClearMenu';
import { CommonMenu } from './CommonMenu';
import { DebugMenu } from './DebugMenu';
import { ExportMenu } from './ExportMenu';
import { GridAppearanceMenu } from './GridAppearanceMenu';
import { GridLayoutMenu } from './GridLayoutMenu';
import { HelpMenu } from './HelpMenu';
import { InterfaceSettingsMenu } from './InterfaceSettingsMenu';
import { LoadMenu } from './LoadMenu';
import { PreviewMenu } from './PreviewMenu';
import { RememberSelectionMenu } from './RememberSelectionMenu';
import { ViewportMenu } from './ViewportMenu';

export function Menu() {
	const locale = getLocale();

	const pane = new Pane({
		title: 'Menu',
		expanded: false,
	});

	/**
	 * @see https://github.com/tweakpane/plugin-essentials
	 */
	pane.registerPlugin(EssentialsPlugin);

	const tab = pane.addTab({
		pages: [
			{title: locale['menu.tab.general']},
			{title: locale['menu.tab.export']},
			{title: locale['menu.tab.settings']},
			{title: locale['menu.tab.tools']}
		]
	});

	const getPage = (index=0) => {
		return tab.pages[index];
	};

	// default config
	/**
	 * @type {import('@renderer/types/menu.types').MenuConfig}
	 */
	const config = {
		enabledScrollY: false,
		init: () => {
			const parentElement = pane.element.parentElement;
			parentElement.style.minWidth = '256px';
			parentElement.style.width = 'fit-content';
			parentElement.style.overflowY = 'auto';
			parentElement.style.overflowX = 'hidden';
			parentElement.style.scrollbarColor = '#161616 #5a5c5d';
			parentElement.style.scrollbarWidth = 'thin';
			config.updateAlignment();
		},
		alignLeft: () => {
			pane.element.parentElement.style.right = 'unset';
			pane.element.parentElement.style.left = toPx(8);
			pane.element.parentElement.style.transform = 'none';
			Global.set_menu_window_alignment({ align: 'left' });
		},
		alignRight: () => {
			pane.element.parentElement.style.right = toPx(8);
			pane.element.parentElement.style.left = 'unset';
			pane.element.parentElement.style.transform = 'none';
			Global.set_menu_window_alignment({ align: 'right' });
		},
		alignTopMiddle: () => {
			pane.element.parentElement.style.right = 'unset';
			pane.element.parentElement.style.left = '50%';
			pane.element.parentElement.style.transform = 'translate(-50%, 0)';
			Global.set_menu_window_alignment({ align: 'top-middle' });
		},
		updateAlignment: () => {
			const align = Global.state.menuWindowAlignment.align;

			switch (align) {
			case 'top-middle':
				config.alignTopMiddle();
				break;
			case 'right':
				config.alignRight();
				break;
			default:
				config.alignLeft();
				break;
			}
		},
		update: () => {
			const parentElement = pane.element.parentElement;

			if (pane.element.offsetHeight > window.innerHeight - 20) {
				if (!config.enabledScrollY) {
					parentElement.style.bottom = '8px';
					config.enabledScrollY = true;
				}
			} else {
				if (config.enabledScrollY) {
					config.enabledScrollY = false;
					parentElement.style.bottom = 'unset';
				}
			}
		}
	};

	config.init();

	// general
	HelpMenu({ pane, page: getPage(0) });
	LoadMenu({ pane, page: getPage(0) });
	CommonMenu({ pages: tab.pages });
	AnimationControlsMenu({ pane, page: getPage(0) });
	GridLayoutMenu({ pane, page: getPage(0) });
	const viewport = ViewportMenu({ pane, page: getPage(0) });
	const preview = PreviewMenu({ pane, page: getPage(0) });
	// export
	ExportMenu({ pane, page: getPage(1) });
	// settings
	RememberSelectionMenu({ pane, page: getPage(2) });
	GridAppearanceMenu({ pane, page: getPage(2) });
	InterfaceSettingsMenu({ pane, page: getPage(2) });
	// tools
	AnimationPreviewWindowMenu({ pane, page: getPage(3) });
	ClearMenu({ pane, page: getPage(3) });
	AlignToolMenu({ config, pane, page: getPage(3) });
	DebugMenu({ page: getPage(3) });

	Global.ticker.add(() => {
		update();
	});

	function update() {
		viewport.update();
		preview.update?.();
		config.update();
	}
}

