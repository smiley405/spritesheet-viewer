import esbuild from 'esbuild';
import path from 'path';

const r = (src) => path.resolve(process.cwd(), src);

async function build() {
	const mainSrc = r('./src/renderer/main.js');
	const outfile = r('./out/app.min.js');

	let ctx = await esbuild.context({
		sourcemap: true,
		entryPoints: [mainSrc],
		bundle: true,
		outfile, 
		write: true,
		minify: true,
		target: 'es6',
	});

	await ctx.watch();
	console.log('watching...', mainSrc);
}

build();
