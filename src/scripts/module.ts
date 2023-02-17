import { setApi } from "src/main.js";
import API from "./api.js";
import CONSTANTS from "./constants.js";
import * as DoorControlIconScale from "./features/door_control_icon_scale.js";
import * as HighlightSecretDoors from "./features/highlight_secret_doors.js";
import * as LockedDoorAlert from "./features/locked_door_alert.js";
import * as SynchronizedDoors from "./features/synchronized_doors.js";
import * as ToggleSecretDoor from "./features/toggle_secret_door.js";
import { registerSocket } from "./socket.js";
import { i18n } from "./lib/lib.js";

export const initHooks = () => {
	// warn("Init Hooks processing");
	// setup all the hooks
	Hooks.once("socketlib.ready", registerSocket);
	registerSocket();
};

export const setupHooks = () => {
	// warn("Setup Hooks processing");
	setApi(API);
};

export const readyHooks = async () => {
	// hookDoorEvents();
	// hookWallConfigUpdate();
	// hookDoorControlDraw();
	// DoorControlIconScale.hookDoorControlReposition();

	// Hook mouse events on DoorControls to perform our logic.
	// If we successfully handled the event block the original handler. Forward the event otherwise.

	// Replace the original mousedown handler with our custom one
	//@ts-ignore
	libWrapper.register(
		CONSTANTS.MODULE_NAME,
		"DoorControl.prototype._onMouseDown",
		function (wrapped, event) {
			// Call our handler first. Only allow the original handler to run if our handler returns true
			const eventHandled = onDoorMouseDown.call(this, event);
			if (eventHandled) return;
			return wrapped(event);
		},
		"MIXED"
	);

	// Replace the original rightdown handler with our custom one
	//@ts-ignore
	libWrapper.register(
		CONSTANTS.MODULE_NAME,
		"DoorControl.prototype._onRightDown",
		function (wrapped, event) {
			// Call our handler first. Only allow the original handler to run if our handler returns true
			const eventHandled = onDoorRightDown.call(this, event);
			if (eventHandled) return;
			return wrapped(event);
		},
		"MIXED"
	);

	// Hook the update function of the WallConfig dialog so we can store our custom data

	// Replace the original function with our custom one
	//@ts-ignore
	libWrapper.register(
		CONSTANTS.MODULE_NAME,
		"WallConfig.prototype._updateObject",
		async function (wrapped, event, formData) {
			await wrapped(event, formData);
			return SynchronizedDoors.onWallConfigUpdate.call(this, event, formData);
		},
		"WRAPPER"
	);

	//@ts-ignore
	libWrapper.register(
		CONSTANTS.MODULE_NAME,
		"DoorControl.prototype.draw",
		async function (wrapped) {
			const result = await wrapped();
			DoorControlIconScale.onDoorControlPostDraw.call(this);
			return result;
		},
		"WRAPPER"
	);

	// Adjust the repositioning formula for the door controls
	//@ts-ignore
	libWrapper.register(
		CONSTANTS.MODULE_NAME,
		"DoorControl.prototype.reposition",
		function () {
			let gridSize = this.wall.scene.grid.size;
			let doorControlSizeFactor = <number>game.settings.get(CONSTANTS.MODULE_NAME, "doorControlSizeFactor");
			gridSize *= doorControlSizeFactor;
			const pos = this.wall.midpoint.map((p) => p - gridSize * 0.2);
			this.position.set(...pos);
		},
		"OVERRIDE"
	);
};

Hooks.on("renderChatMessage", (message, html, data) => {
	LockedDoorAlert.onRenderChatMessage(message, html, data);
});

Hooks.on("canvasReady", (currentCanvas) => {
	DoorControlIconScale.onCanvasReady(currentCanvas);
    HighlightSecretDoors.onCanvasReady(currentCanvas);
});

Hooks.on("updateWall", (wall, update, options) => {
	HighlightSecretDoors.onUpdateWall(wall, update, options);
});

Hooks.on("renderWallConfig", async (app, html, options) => {
    // SynchronizedDoors.onRederWallConfig(app, html, options);
	// let entity = app.object.flags['monks-active-tiles']?.entity || {};
	// if (typeof entity == "string" && entity)
	// 	entity = JSON.parse(entity);
	// let tilename = "";
	// if (entity.id)
	// 	tilename = entity.id == "within" ? i18n("MonksActiveTiles.WithinWall") : await MonksActiveTiles.entityName(entity);
	// let triggerData = mergeObject({ tilename: tilename, showtagger: game.modules.get('tagger')?.active }, (app.object.flags['monks-active-tiles'] || {}));
	// triggerData.entity = JSON.stringify(entity);

	let smartDoorsData = mergeObject(
		{
			// ADD DATA
		},
		app.object.flags[CONSTANTS.MODULE_NAME] || {}
	);
	let wallHtml = await renderTemplate(`modules/${CONSTANTS.MODULE_NAME}/templates/wall-config.html`, smartDoorsData);

	if ($(".sheet-tabs", html).length) {
		$(".sheet-tabs", html).append(
			$("<a>")
				.addClass("item")
				.attr("data-tab", CONSTANTS.MODULE_NAME)
				.html('<i class="fas fa-running"></i> Smart Doors')
		);
		$("<div>")
			.addClass("tab action-sheet")
			.attr("data-tab", CONSTANTS.MODULE_NAME)
			.html(wallHtml)
			.insertAfter($(".tab:last", html));
	} else {
		let root = $("form", html);
		if (root.length == 0) root = html;
		let basictab = $("<div>").addClass("tab").attr("data-tab", "basic");
		$("> *:not(button)", root).each(function () {
			basictab.append(this);
		});

		$(root)
			.prepend($("<div>").addClass("tab action-sheet").attr("data-tab", CONSTANTS.MODULE_NAME).html(wallHtml))
			.prepend(basictab)
			.prepend(
				$("<nav>")
					.addClass("sheet-tabs tabs")
					.append(
						$("<a>")
							.addClass("item active")
							.attr("data-tab", "basic")
							.html('<i class="fas fa-university"></i> Basic')
					)
					.append(
						$("<a>")
							.addClass("item")
							.attr("data-tab", CONSTANTS.MODULE_NAME)
							.html(`<i class="fas fa-running"></i> Smart Doors`)
					)
			);
	}

	// $('button[data-type="entity"]', html).on("click", ActionConfig.selectEntity.bind(app));
	// $('button[data-type="tagger"]', html).on("click", ActionConfig.addTag.bind(app));
	// $('button[data-type="within"]', html).on("click", (event) => {
	//     let btn = $(event.currentTarget);
	//     $('input[name="' + btn.attr('data-target') + '"]', app.element).val('{"id":"within","name":"' + i18n("MonksActiveTiles.WithinWall") + '"}').next().html(i18n("MonksActiveTiles.WithinWall"));
	// });

	app.options.tabs = [{ navSelector: ".tabs", contentSelector: "form", initial: "basic" }];
	app.options.height = "auto";
	app._tabs = app._createTabHandlers();
	const el = html[0];
	app._tabs.forEach((t) => t.bind(el));

	app.setPosition();
});

// Our custom handler for mousedown events on doors
function onDoorMouseDown(event) {
	// If the user doesn't have the "door" permission we don't do anything.
	if (!game.user?.can("WALL_DOORS")) {
		return false;
	}
	// If the game is paused don't do anything if the current player isn't the gm
	if (game.paused && !game.user?.isGM) {
		return false;
	}
	if (ToggleSecretDoor.onDoorLeftClick.call(this)) {
		return true;
	}
	if (LockedDoorAlert.onDoorLeftClick.call(this)) {
		return true;
	}
	if (SynchronizedDoors.onDoorLeftClick.call(this)) {
		return true;
	}
	return false;
}

// Our custom handler for rightdown events on doors
function onDoorRightDown(event) {
	if (SynchronizedDoors.onDoorRightClick.call(this)) {
		return true;
	}
	return false;
}

// // Hook the update function of the WallConfig dialog so we can store our custom data
// function hookWallConfigUpdate() {
// 	// Replace the original function with our custom one
// 	//@ts-ignore
// 	libWrapper.register(
// 		CONSTANTS.MODULE_NAME,
// 		"WallConfig.prototype._updateObject",
// 		async function (wrapped, event, formData) {
// 			await wrapped(event, formData);
// 			return SynchronizedDoors.onWallConfigUpdate.call(this, event, formData);
// 		},
// 		"WRAPPER",
// 	);
// }

// function hookDoorControlDraw() {
// 	//@ts-ignore
// 	libWrapper.register(
// 		CONSTANTS.MODULE_NAME,
// 		"DoorControl.prototype.draw",
// 		async function (wrapped) {
// 			const result = await wrapped();
// 			DoorControlIconScale.onDoorControlPostDraw.call(this);
// 			return result;
// 		},
// 		"WRAPPER",
// 	);
// }

// // Hook mouse events on DoorControls to perform our logic.
// // If we successfully handled the event block the original handler. Forward the event otherwise.
// function hookDoorEvents() {
// 	// Replace the original mousedown handler with our custom one
// 	//@ts-ignore
// 	libWrapper.register(
// 		CONSTANTS.MODULE_NAME,
// 		"DoorControl.prototype._onMouseDown",
// 		function (wrapped, event) {
// 			// Call our handler first. Only allow the original handler to run if our handler returns true
// 			const eventHandled = onDoorMouseDown.call(this, event);
// 			if (eventHandled) return;
// 			return wrapped(event);
// 		},
// 		"MIXED",
// 	);

// 	// Replace the original rightdown handler with our custom one
// 	//@ts-ignore
// 	libWrapper.register(
// 		CONSTANTS.MODULE_NAME,
// 		"DoorControl.prototype._onRightDown",
// 		function (wrapped, event) {
// 			// Call our handler first. Only allow the original handler to run if our handler returns true
// 			const eventHandled = onDoorRightDown.call(this, event);
// 			if (eventHandled) return;
// 			return wrapped(event);
// 		},
// 		"MIXED",
// 	);
// }
