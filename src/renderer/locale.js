export function getLocale() {
	return {
		'warn.empty_frames': 'At least one frame is required. The frame list is empty!',
		'warn.will_clear_all_frames': 'Are you sure? This will clear all frames!',
		'warn.cant_retain_frames': 'Previous frames boundaries exceed the current viewport image. Can not retain previous frames!',
		'warn.file_format_not_supported': 'This file format is not supported yet.',
		'warn.viewport_is_empty': 'The viewport is empty!',
		'warn.drop_single_file': 'Only one file can be dropped at a time.',

		'warn.ffmpeg.missing': 'Error: ffmpeg was not found. Exporting requires ffmpeg to be installed.',

		'btn.cancel': 'Cancel',
		'btn.ok': 'Ok',
		'btn.set': 'Set',
		'btn.reset': 'Reset',
		'btn.play': 'Play',
		'btn.stop': 'Stop',
		'btn.select_all': 'Select All',

		'menu.upload': 'Upload',
		'menu.export': 'Export',
		'menu.grid': 'Grid',
		'menu.clear': 'Clear',
		'menu.remember': 'Remember',
		'menu.settings': 'Settings',
		'menu.help': 'Help',

		'anim.fps': 'fps',
		'anim.loop': 'Loop',
		'anim.duration': 'Duration',
		'anim.milliseconds': 'ms',

		'upload.choose_file': 'Choose file',

		'export.file_name': 'File Name',
		'export.png_sequences': 'PNG Sequences',
		'export.gif': 'GIF',
		'export.gif_quality': 'GIF quality',
		'export.default_file_name': 'frame',

		'grid.width' : 'width',
		'grid.height' : 'height',
		'grid.color' : 'color',
		'grid.show' : 'show',
		'grid.link' : 'link dimensions',

		'clear.grid': 'Grid',
		'clear.viewport': 'Viewport',
		'clear.frames': 'Frames',
		'clear.animation_controller': 'Animation Controller',

		'remember.grid': 'Grid',
		'remember.viewport': 'Viewport: zoom & pan',
		'remember.preview': 'Preview: zoom & pan',
		'remember.frames': 'Frames',
		'remember.animation_controller': 'Animation Controller',

		'settings.viewport_background_color': 'Viewport background color',
		'settings.preview_background_color': 'Preview background color',
		'settings.rendering_pixelated': 'Rendering: Pixelated',
		'settings.viewport_live_update_active_frames': 'Viewport: Live update on selected frames',

		'display.viewport': 'Viewport',
		'display.preview': 'Preview',
		'display.zoom': 'zoom',
		'display.x': 'x',
		'display.y': 'y',

		'preloader.loading': 'Loading',

		'help.upload': 'To upload a file, drag and drop it into the viewport or go to Menu → Upload.',
		'help.how_to_add_frames' : 'After creating the grid, press Ctrl + Left Click to select or deselect a grid frame, or Shift + Left Click to create a rectangular selection.',
		'help.zoom' : 'Use the mouse wheel to zoom in or out of the preview and viewport windows.',
		'help.pan' : 'Click and drag with the left mouse button to pan the preview and viewport windows.',
		'help.export' : 'FFmpeg installation is required to export GIFs.',
		'help.remember' : 'Go to Menu → Remember to re-apply the current settings to the next uploaded file.',
		'help.toogle_play' : 'Press the Spacebar to play or pause.',
		'help.cycle_frames' : 'There are three ways to navigate selected frames:<br> 1) Click on an individual frame from the frame collection.<br> 2) Press the "Z" key and Left Click on frames in the viewport.<br> 3) Use the Left Arrow key to move to the previous frame, and the Right Arrow key to move to the next frame.',
	};
}
