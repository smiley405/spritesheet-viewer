/**
 * @typedef {'left'|'right'|'shift'|'ctrl'|'alt'|'z'|'q'|'space'} keysId
 */

/**
 * @typedef {{[id:string]: keyData}} keys
 */

/**
 * @typedef {{[id: string]: number}} keyCodes
 */

/**
 * @typedef {{code: number, isDown: boolean, isUp: boolean, press?: Function, release?: Function, downHandler: KeyHandler, upHandler: KeyHandler}} keyData
 */

/**
 * @typedef {(event: KeyboardEvent) => void} KeyHandler
 */

/**
 * @typedef {(keyId: string) => keyData} FGetKey
 */

/**
 * @typedef {{getKey: FGetKey}} KeyboardReturns
 */

/**
 * @callback KeyboardFn
 * @param {keyCodes} keyCodes
 * @returns {KeyboardReturns}
 */
