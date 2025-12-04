/**
 * @typedef {{name: string, version: string}} TAppInfo
 */

/**
 * @typedef {{imgSrc: string[]}} TSavePngSequences
 */

/**
 * @typedef {{imgSrc: string[]}} TSaveGif
 */

/**
 * @typedef {{ name: string, images: string[], fileNameTags?: string }} TExportPngSequencesPayload
 */

/**
 * @typedef {{ name: string, images: string[], duration: number, width: number, height: number, fileNameTags?: string }} TExportGifPayload
 */

/**
 * @typedef {'top-down' | 'left-right' | 'diagonal' | 'alt-diagonal' | 'binary-tree'} TSpriteSheetAlgorithm
 */

/**
 * @typedef {{ name: string, images: string[], algorithm: TSpriteSheetAlgorithm, padding: number, fileNameTags?: string }} TExportSpriteSheetPayload
 */

/**
 * @typedef {'Default' | 'Iceberg' | 'Jetblack' | 'Light' | 'Retro' | 'Translucent' | 'Vivid'} UITheme
 */

/**
 * @typedef {'success' | 'warn' | 'failed'} NotificationType
 */

/**
 * @typedef {object} TPoint
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {object} TDimension
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {TPoint & TDimension} TRectBounds
 */
