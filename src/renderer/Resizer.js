import { getGameConfig } from './config';
import { getDivElementById } from './utils';

export function Resizer() {
	window['CHANNEL'] = 'desktop';
	window['QUALITY'] = 'HD';

	function scale() {
		var qualities = getGameConfig().qualities; 
		var quality = qualities[window['QUALITY']];
		var root = getDivElementById('root');
		var ratioWidth = (window.innerWidth / quality.width);
		var ratioHeight = (window.innerHeight / quality.height);
		var top = -(quality.height - window.innerHeight) / 2;
		var left = -(quality.width - window.innerWidth) / 2;
		root.style.transform = 'scale(' + (ratioWidth < ratioHeight ? ratioWidth : ratioHeight) + ')';
		root.style.top = top.toString() + 'px';
		root.style.left = left.toString() + 'px';
	}
	scale();
	window.onresize = scale;
}
