/**
 * @callback FTicker
 * @returns {TTicker}
 */

/**
 * @typedef {object} TTicker
 * @property {FTickerAdd} add
 * @property {FTickerRemove} remove
 */

/**
 * @callback FTickerUpdate
 * @returns {void}
 */

/**
 * @callback FTickerAdd
 * @param {FTickerUpdate} callback
 * @returns {number}
 */

/**
 * @callback FTickerRemove
 * @param {number} id
 * @returns {void}
 */

/**
 * @typedef {{[id: string]: FTickerUpdate}} TTickerUpdaters
 */

/**
 * @typedef {{[id: string]: FTickerRender}} TTickerRenderers
 */

/**
 * @typedef {FTickerUpdate} FTickerRender
 */
