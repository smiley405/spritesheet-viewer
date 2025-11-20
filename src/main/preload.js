const { contextBridge, ipcRenderer, webUtils } = require('electron');

/**
 * @type {TElectronBridgeState}
 */
const bridgeState = {
	// Main to renderer
	updateImage: (callback) => ipcRenderer.on('update-image', callback),
	error: (callback) => ipcRenderer.on('error', callback),
	exportOverwriteAsk: (callback) => ipcRenderer.on('export-overwrite-ask', callback),
	exportProgress: (callback) => ipcRenderer.on('export-progress', callback),
	exportCompleted: (callback) => ipcRenderer.on('export-completed', callback),
	// Renderer to main (one-way)
	dropFile: (file) => ipcRenderer.send('dropped-file', webUtils.getPathForFile(file)),
	exportOverwriteReply: (result) => ipcRenderer.send('export-overwrite-reply', result),
	saveRecord: (payload) => ipcRenderer.send('save-record', payload),
	deleteRecord: (payload) => ipcRenderer.send('delete-record', payload),
	// Renderer to main (two-way)
	packageJSON: () => ipcRenderer.invoke('package-json'),
	toggleAppMenubar: () => ipcRenderer.invoke('toggle-app-menubar-visibility'),
	savePngSequences: (payload) => ipcRenderer.invoke('save-png-sequences', payload),
	saveGif: (payload) => ipcRenderer.invoke('save-gif', payload),
	saveSpriteSheet: (payload) => ipcRenderer.invoke('save-sprite-sheet', payload),
	getRecord: (payload) => ipcRenderer.invoke('get-record', payload),
};

contextBridge.exposeInMainWorld( 'state', bridgeState);
