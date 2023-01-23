"use strict";

import {libWrapper} from "../lib/libwrapper_shim.js";
import * as DoorControlIconScale from "./features/door_control_icon_scale.js";
import * as HighlightSecretDoors from "./features/highlight_secret_doors.js";
import * as LockedDoorAlert from "./features/locked_door_alert.js";
import * as SynchronizedDoors from "./features/synchronized_doors.js";
import * as ToggleSecretDoor from "./features/toggle_secret_door.js";

import {performMigrations} from "./migration.js";
import {registerKeybindings} from "./keybindings.js";
import {registerSettings, settingsKey} from "./settings.js";

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once("init", () => {
	registerSettings();
	registerKeybindings();

	hookDoorEvents();
	hookWallConfigUpdate();
	hookDoorControlDraw();
	DoorControlIconScale.hookDoorControlReposition();
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function () {
    setupHooks();
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once("ready", () => {
    if (!game.modules.get('lib-wrapper')?.active && game.user?.isGM) {
        let word = 'install and activate';
        if (game.modules.get('lib-wrapper'))
            word = 'activate';
        throw error(`Requires the 'libWrapper' module. Please ${word} it.`);
    }
	// TODO INTEGRATE API WITH SOCKETLIB
    // if (!game.modules.get('socketlib')?.active && game.user?.isGM) {
    //     let word = 'install and activate';
    //     if (game.modules.get('socketlib'))
    //         word = 'activate';
    //     throw error(`Requires the 'socketlib' module. Please ${word} it.`);
    // }

	performMigrations();
});

/* ------------------------------------ */
/* Other hooks				*/
/* ------------------------------------ */

Hooks.on("renderChatMessage", LockedDoorAlert.onRenderChatMessage);

Hooks.on("canvasReady", DoorControlIconScale.onCanvasReady);
Hooks.on("canvasReady", HighlightSecretDoors.onCanvasReady);

Hooks.on("updateWall", HighlightSecretDoors.onUpdateWall);

// Inject our custom settings into the WallConfig dialog
Hooks.on("renderWallConfig", SynchronizedDoors.onRederWallConfig);

// Hook the update function of the WallConfig dialog so we can store our custom data
function hookWallConfigUpdate() {
	// Replace the original function with our custom one
	libWrapper.register(
		"smart-doors",
		"WallConfig.prototype._updateObject",
		async function (wrapped, event, formData) {
			await wrapped(event, formData);
			return SynchronizedDoors.onWallConfigUpdate.call(this, event, formData);
		},
		"WRAPPER",
	);
}

function hookDoorControlDraw() {
	libWrapper.register(
		"smart-doors",
		"DoorControl.prototype.draw",
		async function (wrapped) {
			const result = await wrapped();
			DoorControlIconScale.onDoorControlPostDraw.call(this);
			return result;
		},
		"WRAPPER",
	);
}

// Hook mouse events on DoorControls to perform our logic.
// If we successfully handled the event block the original handler. Forward the event otherwise.
function hookDoorEvents() {
	// Replace the original mousedown handler with our custom one
	libWrapper.register(
		"smart-doors",
		"DoorControl.prototype._onMouseDown",
		function (wrapped, event) {
			// Call our handler first. Only allow the original handler to run if our handler returns true
			const eventHandled = onDoorMouseDown.call(this, event);
			if (eventHandled) return;
			return wrapped(event);
		},
		"MIXED",
	);

	// Replace the original rightdown handler with our custom one
	libWrapper.register(
		"smart-doors",
		"DoorControl.prototype._onRightDown",
		function (wrapped, event) {
			// Call our handler first. Only allow the original handler to run if our handler returns true
			const eventHandled = onDoorRightDown.call(this, event);
			if (eventHandled) return;
			return wrapped(event);
		},
		"MIXED",
	);
}

// Our custom handler for mousedown events on doors
function onDoorMouseDown(event) {
	// If the user doesn't have the "door" permission we don't do anything.
	if (!game.user.can("WALL_DOORS")) return false;
	// If the game is paused don't do anything if the current player isn't the gm
	if (game.paused && !game.user.isGM) return false;

	if (ToggleSecretDoor.onDoorLeftClick.call(this, event)) return true;

	if (LockedDoorAlert.onDoorLeftClick.call(this)) return true;

	if (SynchronizedDoors.onDoorLeftClick.call(this)) return true;

	return false;
}

// Our custom handler for rightdown events on doors
function onDoorRightDown(event) {
	if (SynchronizedDoors.onDoorRightClick.call(this)) return true;

	return false;
}

/* ===================================== */

/**
 * Initialization helper, to set API.
 * @param api to set to game module.
 */
 export function setApi(api) {
    const data = game.modules.get(CONSTANTS.MODULE_NAME);
    data.api = api;
}
/**
 * Returns the set API.
 * @returns Api from games module.
 */
export function getApi() {
    const data = game.modules.get(CONSTANTS.MODULE_NAME);
    return data.api;
}
/**
 * Initialization helper, to set Socket.
 * @param socket to set to game module.
 */
export function setSocket(socket) {
    const data = game.modules.get(CONSTANTS.MODULE_NAME);
    data.socket = socket;
}
/*
 * Returns the set socket.
 * @returns Socket from games module.
 */
export function getSocket() {
    const data = game.modules.get(CONSTANTS.MODULE_NAME);
    return data.socket;
}
