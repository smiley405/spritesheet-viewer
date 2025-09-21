export function getGameConfig() {
	return {
		// must be same in css #canvas
		qualities: {
			'FHD': {
				width: 1920,
				height: 1080
			},
			'HD': {
				width: 1280,
				height: 720
			},
			'QHD': {
				width: 960,
				height: 540
			},
			'DEFAULT': {
				width: 320,
				height: 180
			}
		}
	};
}
