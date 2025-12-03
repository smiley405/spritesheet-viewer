import { Emitter } from '@renderer/Emitter';
import { ANIMATION_CONTROLS_EVENTS } from '@renderer/events/AnimationControlsEvents';
import { FRAMES_EVENTS } from '@renderer/events/FramesEvents';
import { Global } from '@renderer/Global';
import { getLocale } from '@renderer/locale';
import { formatValue, fpsToMs, msToFPS } from '@renderer/utils';

import { ShowFolderNotification } from './MenuUtils';

/**
 * @type {import('@renderer/types/menu.types').BaseMenu}
 */
export function AnimationControlsMenu({ page }) {
	let syncInput = false;
	const locale = getLocale();
	const state = Global.state;

	const f = page.addFolder({
		title: locale['anim.title'],
		expanded: false
	});
	const folderNotification = ShowFolderNotification(f);

	const init = () => {
		const f1 = f.addFolder({
			title: locale['anim.durationMs'],
			expanded: true
		});
		const f2 = f.addFolder({
			title: locale['anim.frameRate'],
			expanded: true
		});

		const durationMsInput = f1.addBinding(state.animationController, 'durationMs', {
			label: '',
			min: 0,
			step: 0.1
		}).on('change', e => {
			if (syncInput) {
				syncInput = false;
				return;
			}
			syncInput = true;
			state.animationController.frameRate = msToFPS(e.value);
			fpsInput.refresh();
		});

		const fpsInput = f2.addBinding(state.animationController, 'frameRate', {
			label: '',
			min: 0,
			step: 0.1
		}).on('change', e => {
			if (syncInput) {
				syncInput = false;
				return;
			}
			syncInput = true;
			// Will return 2-decimal rounded value
			const formatted = formatValue(e.value);
			state.animationController.frameRate = formatted;
			state.animationController.durationMs = fpsToMs(formatted);
			durationMsInput.refresh();
		});

		const loopInput = f.addBinding(state.animationController, 'loop', {
			label: locale['anim.loop']
		});

		const playStatInput = f.addBinding(state.animationController, 'play', {
			label: locale['anim.playMode'],
			disabled: true,
		});

		const isFrameEnded = () => {
			return state.preview.activeFrameIndex === state.preview.totalFrames - 1;
		};

		function refreshInputs() {
			durationMsInput.refresh();
			fpsInput.refresh();
			loopInput.refresh();
			playStatInput.refresh();
		}

		const self = {
			play: () => {
				if (isFrameEnded()) {
					self.restart();
				}
				playStatInput.controller.value.setRawValue(true);
			},
			restart: () => {
				Global.set_preview({
					activeFrameIndex: 0
				});
				Emitter.emit(FRAMES_EVENTS.RESTART);
			},
			stop: () => {
				playStatInput.controller.value.setRawValue(false);
			},
			save: () => {
				Emitter.emit(ANIMATION_CONTROLS_EVENTS.REQUEST_SAVE);
				folderNotification.show(locale['info.settings_saved'], 'warn');
			},
			reset: () => {
				Global.set_animation_controller(Global.defaultAnimationController());
				Emitter.emit(ANIMATION_CONTROLS_EVENTS.REQUEST_DELETE);
				refreshInputs();
				folderNotification.show(locale['info.reset_applied']);
			}
		};

		/**
		 * @see https://github.com/tweakpane/plugin-essentials
		 */
		f.addBlade({
			view: 'buttongrid',
			size: [3, 1],
			cells: (x, y) => ({
				title: [
					[locale['btn.restart'], locale['btn.play'], locale['btn.stop']],
				][y][x],
			}),
			label: locale['info.controls'],
		}).on('click', (ev) => {
			// console.log(ev);
			const id = ev.index.toString();

			switch (id) {
			case '0,0':
				self.restart();
				break;
			case '1,0':
				self.play();
				break;
			case '2,0':
				self.stop();
				break;
			}
		});

		f.addBlade({
			view: 'buttongrid',
			size: [2, 1],
			cells: (x, y) => ({
				title: [
					[locale['btn.reset'], locale['btn.save']],
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
				self.save();
				break;
			}
		});

		// spacebar toggles play/stop
		Global.keyboard('space').press = () => {
			if (state.animationController.play) {
				self.stop();
			} else {
				self.play();
			}
		};
	};

	// Tweakpane steals Spacebar, override it
	// fully disable or intercept Spacebar before Tweakpane receives it
	window.addEventListener('keydown', (e) => {
		if (e.code === 'Space') {
			e.preventDefault();
			e.stopPropagation();
		}
	});

	Emitter.emit(ANIMATION_CONTROLS_EVENTS.REQUEST_LOAD);
	Emitter.on(ANIMATION_CONTROLS_EVENTS.REQUEST_LOAD_COMPLETE, init);
}
