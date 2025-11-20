import path from 'node:path';
import { fileURLToPath } from 'node:url';

import readFile from '@stdlib/fs-read-file';
import { FSWatcher,watch } from 'chokidar';
import { app, BrowserWindow, dialog,ipcMain, nativeTheme } from 'electron';
import Store from 'electron-store';
import {execa} from 'execa';
import fs from 'fs-extra';
import { glob } from 'glob';
import mime from 'mime';
import Spritesmith from 'spritesmith';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const eStore = new Store();

/**
 * Save data using electron-store
 * @param {string} id
 * @param {*} value
 * @returns {void}
 */
function saveRecord(id, value) {
	eStore.set(id, value);
}

/**
 * Get data using electron-store
 * @param {string} id
 * @returns {*}
 */
function getRecord(id) {
	const data = eStore.get(id);
	return data;
}

/**
 * Delete data from electron-store
 * @param {string} id
 * @returns {void}
 */
function deleteRecord(id) {
	eStore.delete(id);
}

/**
 * @param {string} src
 * @param {(outputPath: string[]) => void} onComplete
 */
async function readGif(src, onComplete) {
	const path = src.substring(0, src.lastIndexOf('/'));
	const tempDir = `/${path}/__temp__`;

	if (fs.existsSync(tempDir)){
		fs.rmSync(tempDir, {recursive: true, force: true});
	}

	fs.mkdirSync(tempDir);

	// convert gif to pngs
	const cmdFlags = [
		'-i', `${src}`,
		// reverse again to restore original order
		'-vf', 'reverse',
		'-vsync', '0',
		`${tempDir}/frame%d.png`
	];

	await execa('ffmpeg', cmdFlags);

	const images = await glob(`${tempDir}/*.png`);

	if (!images.length) {
		return;
	}

	const imgSrcs = [];

	images.forEach(img => {
		const type = mime.getType(img);
		const contents = readFile.sync(img);
		const b64 = contents.toString('base64');
		const imgSrc = `data:${type};base64,${b64}`;

		imgSrcs.push(imgSrc);
	});

	onComplete(imgSrcs);

	setTimeout(() => {
		if (fs.existsSync(tempDir)){
			fs.rmSync(tempDir, {recursive: true, force: true});
		}
	}, 1000);
}

async function delay(ms=0) {
	// https://stackoverflow.com/questions/52184291/async-await-with-setinterval
	// https://peerdh.com/blogs/programming-insights/using-async-await-with-settimeout-and-setinterval
	// return await for better async stack trace support in case of errors.
	return await new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @type {FSWatcher}
 */
let watcher;

/**
 * @param {string} src
 * @param {Function} [callback]
 */
function watchFile(src, callback) {

	if (!src) {
		return;
	}

	if (watcher) {
		watcher.close();
		watcher = undefined;
	}

	let isReading = false;

	// https://github.com/paulmillr/chokidar/
	// an npm module which is much better than fs.watch or fs.watchFile
	// a solution to a problem mentioned in https://stackoverflow.com/questions/10468504/why-fs-watchfile-called-twice-in-node
	watcher = watch(src).on('change', async (event, fileName)=> {
		if (fileName && callback) {
			// convert to base64 and pass it through callback
			const type = mime.getType(src);

			if (isReading) {
				return;
			}

			isReading = true;

			let b64 = '';
			const read = () => {
				// https://www.npmjs.com/package/@stdlib/fs-read-file
				// fs-read-file is more accurate than fs.readfile, coz sometimes with that you will get empty data
				const contents = readFile.sync(src);
				b64 = contents.toString('base64');
			};

			read();
			if (!b64) {
				await delay(100);
				read();
			}
			if (!b64) {
				await delay(100);
				read();
			}

			await delay(100);
			isReading = false;

			if (b64) {
				if (type.includes('gif')) {
					await readGif(src, images => {
						callback(images);
					});
				} else {
					const imgSrc = `data:${type};base64,${b64}`;
					callback(imgSrc);
				}
			}
		}
	});
}

const useExportQueue = () => {
	/**
	 * @type {undefined | Function}
	 */
	let queue;

	const set = (/** @type {Function}*/callback) => {
		queue = callback;
	};

	const clear = () => {
		queue = undefined;
	};

	const run = async () => {
		if (queue) {
			await queue();
		}
		clear();
	};

	return {
		set,
		clear,
		run
	};
};

function capitalizeStringAfterDash(str='') {
	return str.split('-')
		.map(word => word[0].toUpperCase() + word.slice(1))
		.join('-');
}

const createWindow = () => {
	const appName = capitalizeStringAfterDash(app.name).replace('-', ' ');
	const appVersion = 'v' + app.getVersion();
	const appInfo = /** @type {TAppInfo} */({
		name: appName,
		version: appVersion,
	});

	// enable this to see icon while on dev
	const icon = path.join(__dirname, '../../build', 'icons', 'icon.png');
	const win = new BrowserWindow({
		icon,
		title: appName,
		width: 800,
		height: 600,
		darkTheme: true,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		}
	});

	const exportQueue = useExportQueue();

	// win.webContents.openDevTools();

	/**
	 * @param {string | string[]} imgSrc - base64 images
	 */
	function sendUpdateImage(imgSrc) {
		win.webContents.send('update-image', imgSrc);
	}

	/**
	 * @param {string} message
	 */
	function error(message) {
		win.webContents.send('error', message);
	}

	/**
	 * @param {string} message
	 */
	function exportProgress(message) {
		win.webContents.send('export-progress', message);
	}

	/**
	 * @param {string} message
	 */
	function exportCompleted(message) {
		win.webContents.send('export-completed', message);
	}

	/**
	 * @param {string} message
	 */
	function exportOverwriteAsk(message) {
		win.webContents.send('export-overwrite-ask', message);
	}

	// Main to renderer
	win.webContents.on('did-finish-load', () => {
		ipcMain.on('dropped-file', async (event, filePath) => {
			watchFile(filePath, sendUpdateImage);

			const type = mime.getType(filePath);

			// parse gif images to combined png sequences
			if (type.includes('gif')) {
				// convert to base64 and pass it through callback
				const contents = readFile.sync(filePath);
				const b64 = contents.toString('base64');

				if (b64) {
					await readGif(filePath, images => {
						sendUpdateImage(images);
					});
				}
			}
		});
		ipcMain.on('save-record', async (_, payload) => {
			saveRecord(payload.id, payload.value);
		});
		ipcMain.on('delete-record', async (_, payload) => {
			deleteRecord(payload.id);
		});
	});

	const devTools = () => {
		// Darkmode issue on electron v.33
		// https://github.com/electron/electron/issues/43367

		const toggleTheme = () => {
		// First, set the theme to 'light'
			nativeTheme.themeSource = 'light';

			// After a short delay, set it to 'dark'
			setTimeout(() => {
				nativeTheme.themeSource = 'dark';
			}, 100); // 100ms delay; adjust if necessary
		};
		// win.webContents.openDevTools();
		win.webContents.on('devtools-opened', () => {
			toggleTheme();
		});
	};
	devTools();

	win.setMenuBarVisibility(false);

	ipcMain.handle('toggle-app-menubar-visibility', () => {
		win.setMenuBarVisibility(!win.menuBarVisible);

		if (win.menuBarVisible) {
			win.webContents.openDevTools();
		} else {
			win.webContents.closeDevTools();
		}
	});

	// Renderer to main (two-way)
	ipcMain.handle('package-json', () => {
		return appInfo;
	});

	ipcMain.handle('get-record', (_, payload) => {
		return getRecord(payload.id);
	});

	ipcMain.on('export-overwrite-reply', async (event, result) => {
		if (result) {
			await exportQueue.run();
		}

		exportQueue.clear();
	});

	ipcMain.handle('save-png-sequences', (e, /** @type {TExportPngSequencesPayload} */ payload) => {
		dialog.showOpenDialog(win, {
			properties: ['openFile', 'openDirectory']
		}).then(async result => {
			if (!result.canceled) {
				const dir = result.filePaths[0];
				const images = payload.images;
				const name = payload.name;
				const fileNameTags = payload.fileNameTags;

				exportQueue.set(async () => {
					exportProgress('Please Wait..');

					images.forEach((img, i) => {
						const fileName = `${name}_${i}.png`;
						const filePath = `${dir}/${fileName}${fileNameTags}`;
						const base64Data = img.split('base64,')[1];
						fs.writeFileSync(filePath, base64Data, 'base64');
					});

					exportCompleted(`Export of ${dir}/ png sequences completed!!!`);
				});

				// check file existence
				const fileExistsList = [];

				images.forEach((img, i) => {
					const fileName = `${name}_${i}.png`;
					const filePath = `${dir}/${fileName}${fileNameTags}`;

					if (fs.existsSync(filePath)){
						fileExistsList.push(filePath);
					}
				});

				if (fileExistsList.length){
					let files = '';

					fileExistsList.forEach(file => {
						files += `<br>${file}<br>`;
					});

					exportOverwriteAsk(`File Already Exists!::<br>${files}<br>Do you want to overwrite?`);
				} else {
					await exportQueue.run();
				}
			}

		}).catch(err => {
			error(JSON.stringify(err));
		});

		// return true;
	});

	ipcMain.handle('save-gif', async (e, /** @type {TExportGifPayload}*/ payload) => {
		const ffmpeg = await execa('ffmpeg', ['-version']);
		if (!ffmpeg.stdout.includes('version')) {
			return /** @type {TElectronBridgeStateExportPayload}*/ ({ error: -1 });
		}

		dialog.showOpenDialog(win, {
			properties: ['openFile', 'openDirectory']
		}).then(async result => {
			if (!result.canceled) {
				const dir = result.filePaths[0];
				const name = payload.name;
				const fileNameTags = payload.fileNameTags;
				const tempDir = `${dir}/__temp__`;
				const images = payload.images;
				const fps = payload.duration;
				const outFilePath = `${dir}/${name}${fileNameTags}.gif`;

				exportQueue.set(async () => {
					exportProgress('Please Wait..');

					if (fs.existsSync(tempDir)){
						fs.rmSync(tempDir, {recursive: true, force: true});
					}

					fs.mkdirSync(tempDir);

					images.forEach((img, i) => {
						const fileName = `${name}_${i}.png`;
						const filePath = `${tempDir}/${fileName}`;
						const base64Data = img.split('base64,')[1];
						fs.writeFileSync(filePath, base64Data, 'base64');
					});

					const palettePath = `${tempDir}/palette.png`;
					const paletteCmdFlags = ['-y', '-pattern_type', 'glob', '-i', `${tempDir}/${name}*.png`, '-vf', 'palettegen', `${palettePath}` ];

					const logs = [];
					const getLog = (txt='') => {
						let output = '';
						logs.push(txt);
						logs.forEach(text => {
							output += `<br>${text}<br>`;
						});
						return output;
					};

					await execa('ffmpeg', paletteCmdFlags);
					exportProgress(getLog('Execution of shell:palette cmd completed!!!'));

					const gifCmdFlags = ['-y', '-r', `${fps}`, '-pattern_type', 'glob', '-i', `${tempDir}/${name}*.png`, '-i', `${palettePath}`, '-lavfi', 'paletteuse=alpha_threshold=128', '-gifflags', '-offsetting', `${outFilePath}`];

					await execa('ffmpeg', gifCmdFlags);
					exportProgress(getLog('Execution of shell:gif cmd completed!!!'));

					if (fs.existsSync(tempDir)){
						fs.rmSync(tempDir, {recursive: true, force: true});
					}

					exportCompleted(getLog(`Export of ${outFilePath} completed!!!`));
				});

				if (fs.existsSync(outFilePath)){
					exportOverwriteAsk(`${outFilePath} exists!<br><br>Do you want to overwrite this file?`);
				} else {
					await exportQueue.run();
				}

			}

		}).catch(err => {
			error(JSON.stringify(err));
		});

		// return true;
	});

	ipcMain.handle('save-sprite-sheet', async (e, /** @type {TExportSpriteSheetPayload}*/ payload) => {
		dialog.showOpenDialog(win, {
			properties: ['openFile', 'openDirectory']
		}).then(async result => {
			if (!result.canceled) {
				const dir = result.filePaths[0];
				const name = payload.name;
				const fileNameTags = payload.fileNameTags;
				const tempDir = `${dir}/__temp__`;
				const images = payload.images;
				const padding = payload.padding;
				const algorithm = payload.algorithm;
				const outFilePath = `${dir}/${name}${fileNameTags}.png`;
				const tempImagesPath = [];

				exportQueue.set(async () => {
					exportProgress('Please Wait..');

					if (fs.existsSync(tempDir)){
						fs.rmSync(tempDir, {recursive: true, force: true});
					}

					fs.mkdirSync(tempDir);

					images.forEach((img, i) => {
						const fileName = `${name}_${i}.png`;
						const filePath = `${tempDir}/${fileName}`;
						const base64Data = img.split('base64,')[1];
						fs.writeFileSync(filePath, base64Data, 'base64');
						tempImagesPath.push(filePath);
					});

					// Generate our spritesheet
					Spritesmith.run({
						src: tempImagesPath,
						algorithm,
						padding
					}, function handleResult (err, result) {
						// If there was an error, throw it
						if (err) {
							error(JSON.stringify(err));
							throw err;
						}

						// Output the image
						fs.writeFileSync(outFilePath, result.image);
						result.coordinates, result.properties; // Coordinates and properties

						if (fs.existsSync(tempDir)){
							fs.rmSync(tempDir, {recursive: true, force: true});
						}

						exportCompleted(`Export of ${outFilePath} completed!!!<br><br>spritesheet successfully generated`);
					});
				});

				if (fs.existsSync(outFilePath)){
					exportOverwriteAsk(`${outFilePath} exists!<br><br>Do you want to overwrite this file?`);
				} else {
					await exportQueue.run();
				}
			}

		}).catch(err => {
			error(JSON.stringify(err));
		});

		// return true;
	});

	win.loadFile('index.html');
};

app.whenReady().then(() => {
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
