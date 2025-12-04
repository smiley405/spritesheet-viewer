/**
 * @typedef {'PNG Sequences'|'GIF'|'SpriteSheet'} ExportFileType
 */

/**
 * @typedef {'left'|'right'|'top-middle'} AlignmentType
 */

/**
 * @typedef {{width?: number, height?: number, src?: string, currentFileName?: string, pervFileName?: string}} ImageGlobalData
 */

/**
 * @typedef {{align: AlignmentType}} MenuWindowAlignmentGlobalData
 */

/**
 * @typedef {{
 * width?: number,
 * height?: number,
 * prevWidth?: number,
 * prevHeight?: number,
 * totalX?: number,
 * totalY?: number,
 * link?: boolean,
 * }} GridLayoutGlobalData
 */

/**
 * @typedef {{
 * visible?: boolean,
 * color?: string,
 * opacity?: number
 * lineThickness?: number // 0.1 to 1
 * }} GridAppearanceGlobalData
 */

/**
 * @typedef {{layout: GridLayoutGlobalData, appearance: GridAppearanceGlobalData}} GridGlobalData
 */

/**
 * @typedef {{activeFrameIndex?: number, totalFrames?: number, zoom?: number, pan?: PanGlobalData}} PreviewGlobalData
 */

/**
 * @typedef {{zoom?: number, pan?: PanGlobalData}} ViewportGlobalData
 */

/**
 * @typedef {{x?: number, y?: number}} PanGlobalData
 */

/**
 * @typedef {object} TSpriteSheetOptions
 * @property {TSpriteSheetAlgorithm} algorithm
 * @property {number} padding
 */

/**
 * @typedef {{fileName?: string, isPNGSequences?: boolean, isGIF?: boolean, GIFQuality?: number, isSpriteSheet?: boolean, spriteSheetOptions?: TSpriteSheetOptions}} ExportGlobalData
 */

/**
 * @typedef {{grid?: boolean, viewport?: boolean, preview?: boolean, frames?: boolean, sameFileNameOnly?: boolean}} RememberGlobalData
 */

/**
 * @typedef {{grid?: boolean, viewport?: boolean, frames?: boolean, animationController?: boolean}} ClearGlobalData
 */

/**
 * @typedef {'grid'|'image'|'animationController'|'preview'|'viewport'|'settings'|'clear'|'remember'} GlobalDataType
 */

/**
 * @typedef {{backgroundColor: string}} SettingsViewportGlobalData
 */

/**
 * @typedef {{backgroundColor: string, backgroundOpacity?: number, borderWidth?: number, borderColor?: string}} SettingsPreviewGlobalData
 */

/**
 * @typedef {{pixelated: boolean}} SettingsRenderingGlobalData
 */

/**
 * @typedef {{viewport: SettingsViewportGlobalData, preview: SettingsPreviewGlobalData, framesCollection: SettingsViewportGlobalData, rendering: SettingsRenderingGlobalData, theme: UITheme}} SettingsGlobalData
 */

/**
 * @typedef {object} AnimationControllerGlobalData
 * @property {boolean} [loop]
 * @property {number} [durationMs] in milliseconds
 * @property {number} [frameRate]
 * @property {boolean} [play]
 * @property {boolean} [toggleFps]
 */
