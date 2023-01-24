export const settingsKey = "smart-doors";

function reloadGM() {
	if (game.user.isGM) delayedReload();
}

function delayedReload() {
	window.setTimeout(() => location.reload(), 500);
}

export function registerSettings() {
	game.settings.register(settingsKey, "dataVersion", {
		scope: "world",
		config: false,
		type: String,
		default: "fresh install",
	});
	game.settings.register(settingsKey, "doorControlSizeFactor", {
		name: "smart-doors.settings.doorControlSizeFactor.name",
		hint: "smart-doors.settings.doorControlSizeFactor.hint",
		scope: "client",
		config: true,
		type: Number,
		default: 1.5,
		onChange: delayedReload,
	});
	game.settings.register(settingsKey, "highlightSecretDoors", {
		name: "smart-doors.settings.highlightSecretDoors.name",
		hint: "smart-doors.settings.highlightSecretDoors.hint",
		scope: "world",
		config: true,
		type: Boolean,
		default: false,
		onChange: reloadGM,
	});
	game.settings.register(settingsKey, "lockedDoorAlert", {
		name: "smart-doors.settings.lockedDoorAlert.name",
		hint: "smart-doors.settings.lockedDoorAlert.hint",
		scope: "world",
		config: true,
		type: Boolean,
		default: true,
	});
	game.settings.register(settingsKey, "synchronizedDoors", {
		name: "smart-doors.settings.synchronizedDoors.name",
		hint: "smart-doors.settings.synchronizedDoors.hint",
		scope: "world",
		config: true,
		type: Boolean,
		default: true,
	});
}
