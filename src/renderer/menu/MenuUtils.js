import { getLocale } from '@renderer/locale';
import {ButtonApi, FolderApi} from 'tweakpane';

/**
 * @typedef {(message?: string, color?: NotificationType) => void} ShowNotification
 * @param {FolderApi} folder
 * @returns {{show: ShowNotification}}
 */
export function ShowFolderNotification(folder) {
	let timeout;
	/**
	 * @type {ButtonApi}
	 */
	let notification;

	const defaultMessage = getLocale()['info.selected_settings_appied'];

	create();

	function create() {
		notification = folder.addButton({
			title: defaultMessage,
			hidden: true
		});
		notification.controller.buttonController.view.buttonElement.classList.add('folder-notification-success');
	}

	/**
	 * @param {NotificationType} [color]
	 * @returns {void}
	 */
	function setColor(color='success') {
		const buttonElement = notification.controller.buttonController.view.buttonElement;
		const classList = [
			'folder-notification-warn',
			'folder-notification-failed',
			'folder-notification-success',
		];
		let className = '';

		switch (color) {
		case 'warn':
			className = classList[0];
			break;

		case 'failed':
			className = classList[1];
			break;

		default:
			className = classList[2];
			break;
		}

		classList.forEach(id => {
			if (buttonElement.classList.contains(id)) {
				buttonElement.classList.remove(id);
			}
		});

		buttonElement.classList.add(className);
	}

	/**
	 * @type {ShowNotification}
	 */
	function show(message, color='success') {
		if (!notification) {
			return;
		}

		notification.title = message ?? defaultMessage;

		setColor(color);

		if (timeout) {
			clearTimeout(timeout);
			notification.hidden = true;
		}

		notification.hidden = false;

		timeout = setTimeout(() => {
			notification.hidden = true;
		}, 1000);
	}

	return {
		show,
	};
}

/**
 * @param {FolderApi} folder
 * @param {string} title
 * @returns {{show:VoidFunction, hide:VoidFunction}}
 */
export function EditMode(folder, title) {
	return {
		show: () => {
			folder.title = `${title}*`;
		},
		hide: () => {
			folder.title = `${title}`;
		}
	};
};

