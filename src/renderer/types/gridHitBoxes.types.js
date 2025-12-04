/**
 * @typedef {object} HitBoxSharedData
 * @property {string} [ id ]
 * @property {number} [ x ]
 * @property {number} [ y ]
 * @property {number} [ gridWidth ]
 * @property {number} [ gridHeight ]
 * @property {() => void} [ click ]
 */

/**
 * @typedef {object} onClickHitBoxProps
 * @property {THitBox} hitBox
 */

/**
 * @callback TOnClickHitBox
 * @param {onClickHitBoxProps} props
 * @returns {void}
 */

/**
 * @typedef {{[id: string]: THitBox}} HitBoxes
 */

/**
 * @typedef {TRectBounds & {id: string, type?: string}} THitBox
 */

/**
 * @callback TRenderCallback
 * @param {CanvasRenderingContext2D} ctx
 * @returns {void}
 */
