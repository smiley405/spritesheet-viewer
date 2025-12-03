import {Pane, TabPageApi} from 'tweakpane';

/**
 * @typedef {{pane?: Pane, config?: MenuConfig, page: TabPageApi}} BaseMenuProps
 */

/**
 * @typedef {{
 * enabledScrollY?: boolean,
 * init: () => void,
 * alignLeft: () => void,
 * alignRight: () => void,
 * alignTopMiddle: () => void,
 * updateAlignment: () => void,
 * update: () => void
 * }} MenuConfig
 */

/**
 * @callback BaseMenu
 * @param {BaseMenuProps} props
 * @returns {void}
 */

/**
 * @callback BaseMenuReturnsUpdate
 * @param {BaseMenuProps} props
 * @returns {{ update: () => void }}
 */

export {};
