import CONSTANTS from "./constants";
import { dialogWarning, i18n, warn } from "./lib/lib";

export let toggleSecretDoor = false;

export const registerSettings = function (): void {
	game.settings.registerMenu(CONSTANTS.MODULE_NAME, "resetAllSettings", {
		name: `${CONSTANTS.MODULE_NAME}.setting.reset.name`,
		hint: `${CONSTANTS.MODULE_NAME}.setting.reset.hint`,
		icon: "fas fa-coins",
		type: ResetSettingsDialog,
		restricted: true,
	});

	// =====================================================================

	// game.settings.register(CONSTANTS.MODULE_NAME, "dataVersion", {
	// 	name: `${CONSTANTS.MODULE_NAME}.settings.dataVersion.name`,
	// 	hint: `${CONSTANTS.MODULE_NAME}.settings.dataVersion.hint`,
	// 	scope: "world",
	// 	config: false,
	// 	type: String,
	// 	default: "fresh install",
	// });
	game.settings.register(CONSTANTS.MODULE_NAME, "doorControlSizeFactor", {
		name: `${CONSTANTS.MODULE_NAME}.settings.doorControlSizeFactor.name`,
		hint: `${CONSTANTS.MODULE_NAME}.settings.doorControlSizeFactor.hint`,
		scope: "client",
		config: true,
		type: Number,
		default: 1.5,
		onChange: delayedReload,
	});
	game.settings.register(CONSTANTS.MODULE_NAME, "highlightSecretDoors", {
		name: `${CONSTANTS.MODULE_NAME}.settings.highlightSecretDoors.name`,
		hint: `${CONSTANTS.MODULE_NAME}.settings.highlightSecretDoors.hint`,
		scope: "world",
		config: true,
		type: Boolean,
		default: false,
		onChange: reloadGM,
	});
	game.settings.register(CONSTANTS.MODULE_NAME, "lockedDoorAlert", {
		name: `${CONSTANTS.MODULE_NAME}.settings.lockedDoorAlert.name`,
		hint: `${CONSTANTS.MODULE_NAME}.settings.lockedDoorAlert.hint`,
		scope: "world",
		config: true,
		type: Boolean,
		default: true,
	});
	game.settings.register(CONSTANTS.MODULE_NAME, "synchronizedDoors", {
		name: `${CONSTANTS.MODULE_NAME}.settings.synchronizedDoors.name`,
		hint: `${CONSTANTS.MODULE_NAME}.settings.synchronizedDoors.hint`,
		scope: "world",
		config: true,
		type: Boolean,
		default: true,
	});
	game.settings.register(CONSTANTS.MODULE_NAME, "useColorSynchronizedDoors", {
		name: `${CONSTANTS.MODULE_NAME}.settings.useColorSynchronizedDoors.name`,
		hint: `${CONSTANTS.MODULE_NAME}.settings.useColorSynchronizedDoors.hint`,
		scope: "world",
		config: true,
		type: Boolean,
		default: false,
	});

	// =====================================================================

	game.settings.register(CONSTANTS.MODULE_NAME, "debug", {
		name: `${CONSTANTS.MODULE_NAME}.setting.debug.name`,
		hint: `${CONSTANTS.MODULE_NAME}.setting.debug.hint`,
		scope: "client",
		config: true,
		default: false,
		type: Boolean,
	});
};

export const registerKeyBindings = function () {
	game.keybindings.register(CONSTANTS.MODULE_NAME, "toggleSecretDoor", {
		name: `${CONSTANTS.MODULE_NAME}.keybindings.toggleSecretDoor.name`,
		hint: `${CONSTANTS.MODULE_NAME}.keybindings.toggleSecretDoor.hint`,
		onDown: handleToggleSecretDoor,
		onUp: handleToggleSecretDoor,
		restricted: true,
		editable: [{ key: "AltLeft" }],
		precedence: -1,
	});
};

function handleToggleSecretDoor(event) {
	toggleSecretDoor = !event.up;
	return false;
}

function reloadGM() {
	if (game.user?.isGM) {
		delayedReload();
	}
}

function delayedReload() {
	window.setTimeout(() => location.reload(), 500);
}

class ResetSettingsDialog extends FormApplication<FormApplicationOptions, object, any> {
	constructor(...args) {
		//@ts-ignore
		super(...args);
		//@ts-ignore
		return new Dialog({
			title: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.title`),
			content:
				'<p style="margin-bottom:1rem;">' +
				game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.content`) +
				"</p>",
			buttons: {
				confirm: {
					icon: '<i class="fas fa-check"></i>',
					label: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.confirm`),
					callback: async () => {
						const worldSettings = game.settings.storage
							?.get("world")
							?.filter((setting) => setting.key.startsWith(`${CONSTANTS.MODULE_NAME}.`));
						for (let setting of worldSettings) {
							console.log(`Reset setting '${setting.key}'`);
							await setting.delete();
						}
						//window.location.reload();
					},
				},
				cancel: {
					icon: '<i class="fas fa-times"></i>',
					label: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.cancel`),
				},
			},
			default: "cancel",
		});
	}

	async _updateObject(event: Event, formData?: object): Promise<any> {
		// do nothing
	}
}
