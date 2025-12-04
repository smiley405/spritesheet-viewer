import { Emitter } from '@renderer/Emitter';
import { PREVIEW_EVENTS } from '@renderer/events/PreviewEvents';
import { Global } from '@renderer/Global';
import { getLocale } from '@renderer/locale';
import { copyObject } from '@renderer/utils';

/**
 * @type {import('@renderer/types/menu.types').BaseMenu}
 */
export function AnimationPreviewWindowMenu({ page }) {
	const state = Global.state;
	const locale = getLocale();

	// Animation targets the outer window only
	// Good for testing the animation quickly, like the movement etc

	// gsap easing properties
	const easing = {
		currentType: 'none',
		types: {
			none: 'none',
			power1: 'power1',
			power2: 'power2',
			power3: 'power3',
			power4: 'power4',
			back: 'back',
			bounce: 'bounce',
			circ: 'circ',
			elastic: 'elastic',
			expo: 'expo',
			sine: 'sine',
		},
		currentDirection: 'out',
		directions: {
			in: 'in',
			inOUt: 'inOut',
			out: 'out'
		},
	};

	/**
	 * @type {AnimatePreviewWindowProps}
	 */
	const animateProps =  {
		from: {x: 0, y: 0},
		to: {x: 0, y: 0},
		duration: 1,
		yoyo: true,
		repeat: true,
		playing: false,
		ease: '',
	};

	const f = page.addFolder({
		title: locale['animate_preview_window.title'],
		expanded: false
	});

	const f1 = f.addFolder({
		title: locale['animate_preview_window.from'],
		expanded: false
	});

	const f2 = f.addFolder({
		title: locale['animate_preview_window.to'],
		expanded: false
	});

	const px1 = f1.addBinding(animateProps.from, 'x', {
		label: locale['preview.x'],
	});

	const py1 = f1.addBinding(animateProps.from, 'y', {
		label: locale['preview.y'],
	});

	f1.addButton({
		title: locale['animate_preview_window.capture_position'],
	}).on('click', () => {
		px1.controller.value.setRawValue(state.preview.pan.x);
		py1.controller.value.setRawValue(state.preview.pan.y);
	});

	const px2 = f2.addBinding(animateProps.to, 'x', {
		label: locale['preview.x'],
	});

	const py2 = f2.addBinding(animateProps.to, 'y', {
		label: locale['preview.y'],
	});

	f2.addButton({
		title: locale['animate_preview_window.capture_position'],
	}).on('click', () => {
		px2.controller.value.setRawValue(state.preview.pan.x);
		py2.controller.value.setRawValue(state.preview.pan.y);
	});

	const duration = f.addBinding(animateProps, 'duration', {
		label: locale['animate_preview_window.duration']
	});

	const repeat = f.addBinding(animateProps, 'repeat', {
		label: locale['animate_preview_window.repeat'],
	});

	const yoyo = f.addBinding(animateProps, 'yoyo', {
		label: locale['animate_preview_window.yoyo'],
	});

	const easeType = f.addBinding(easing, 'currentType', {
		label: locale['animate_preview_window.ease_type'],
		options: easing.types
	}).on('change', ({ value }) => {
		easeDirection.hidden = value === 'none';
	});

	const easeDirection = f.addBinding(easing, 'currentDirection', {
		label: locale['animate_preview_window.ease_duration'],
		options: easing.directions,
		hidden: easing.currentType === 'none'
	});


	const playStatInput = f.addBinding(animateProps, 'playing', {
		label: locale['animate_preview_window.playing'],
		disabled: true,
	});

	function getCurrentEasing() {
		if (easing.currentType === 'none') {
			return easing.currentType;
		}
		return `${easing.currentType}.${easing.currentDirection}`;
	}

	function start() {
		animateProps.ease = getCurrentEasing();
		const _animateProps = copyObject(animateProps);
		playStatInput.controller.value.setRawValue(true);
		Emitter.emit(PREVIEW_EVENTS.START_WINDOW_ANIMATION, _animateProps);
	}

	function stop() {
		playStatInput.controller.value.setRawValue(false);
		Emitter.emit(PREVIEW_EVENTS.STOP_WINDOW_ANIMATION);
	}

	/**
	 * @see https://github.com/tweakpane/plugin-essentials
	 */
	f.addBlade({
		view: 'buttongrid',
		size: [2, 1],
		cells: (x, y) => ({
			title: [
				[locale['btn.run'], locale['btn.stop']],
			][y][x],
		}),
		label: locale['info.controls'],
	}).on('click', (ev) => {
		// console.log(ev);
		const id = ev.index.toString();

		switch (id) {
		case '0,0':
			start();
			break;
		case '1,0':
			stop();
			break;
		}
	});
}
