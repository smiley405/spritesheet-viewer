/**
 * @typedef {object} TElectronBridgeState
 * @property {TElectronBridgeStateUpdateImage} updateImage
 * @property {TElectronBridgeStateError} error
 * @property {TElectronBridgeStateExportProgress} exportProgress
 * @property {TElectronBridgeStateExportCompleted} exportCompleted
 * @property {TElectronBridgeStateExportOverwriteAsk} exportOverwriteAsk
 * @property {TElectronBridgeStateDropFile} dropFile
 * @property {TElectronBridgeStateExportOverwriteReply} exportOverwriteReply
 * @property {TElectronBridgeStatePackageJSON} packageJSON
 * @property {TElectronBridgeStateSavePngSequences} savePngSequences
 * @property {()=>void} toggleAppMenubar
 * @property {TElectronBridgeStateSaveGif} saveGif
 * @property {TElectronBridgeStateSaveSpriteSheet} saveSpriteSheet
 */


/**
 * @typedef {(e: import("electron").IpcRendererEvent, imgSrc: string | string[]) => void} TElectronBridgeStateUpdateImageCallback
 */

/**
 * @typedef {(callback: TElectronBridgeStateUpdateImageCallback) => void} TElectronBridgeStateUpdateImage
 */

/**
 * @typedef {(e: import("electron").IpcRendererEvent, message: string) => void} TElectronBridgeStateNotifyCallback
 */

/**
 * @typedef {(callback: TElectronBridgeStateNotifyCallback) => void} TElectronBridgeStateError
 */

/**
 * @typedef {(callback: TElectronBridgeStateNotifyCallback) => void} TElectronBridgeStateExportProgress
 */

/**
 * @typedef {(callback: TElectronBridgeStateNotifyCallback) => void} TElectronBridgeStateExportCompleted
 */

/**
 * @typedef {(callback: TElectronBridgeStateNotifyCallback) => void} TElectronBridgeStateExportOverwriteAsk
 */

/**
 * @typedef {(file: File) => void} TElectronBridgeStateDropFile
 */

/**
 * @typedef {(result: boolean) => void} TElectronBridgeStateExportOverwriteReply
 */

/**
 * @typedef {() => Promise<TAppInfo>} TElectronBridgeStatePackageJSON
 */

/**
 * @typedef {(payload: TExportPngSequencesPayload) => Promise<TElectronBridgeStateExportPayload>} TElectronBridgeStateSavePngSequences
 */

/**
 * @typedef {(payload: TExportGifPayload) => Promise<TElectronBridgeStateExportPayload>} TElectronBridgeStateSaveGif
 */

/**
 * @typedef {(payload: TExportSpriteSheetPayload) => Promise<TElectronBridgeStateExportPayload>} TElectronBridgeStateSaveSpriteSheet
 */

/**
 * @typedef {object} TElectronBridgeStateExportPayload
 * @property {number} [ error ]
 */
