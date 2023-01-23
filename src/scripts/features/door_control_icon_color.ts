import CONSTANTS from "../constants";

// Set the color of all door controls in relation to the grid size so it'll have a constant percieved size
export function onCanvasReady(currentCanvas) {
	const doors = currentCanvas.controls.doors.children;
	doors.forEach((control) => fixDoorControlColor(control));
}

// Set the color of the door control in relation to the grid size so it'll have a constant percieved size
export function onDoorControlPostDraw() {
	// If the canvas isn't ready we'll do this after the "canvasReady" event is fired instead
	if (!canvas.ready) return;

	fixDoorControlColor(this);
}

// Resizes the door control according to the grid size
function fixDoorControlColor(control) {
	const doorColor = control.wall.getFlag(CONSTANTS.MODULE_NAME, "doorColor");
	const doorColorShowOnlyGM = control.wall.getFlag(CONSTANTS.MODULE_NAME, "doorColorShowOnlyGM");
	if (control.wall.document.door === CONST.WALL_DOOR_TYPES.DOOR) {
		if (doorColorShowOnlyGM && !game.user?.isGM) {
			control.icon.tint = 0xffffff;
		} else if (doorColor) {
			control.icon.tint = foundry.utils.colorStringToHex(doorColor);
			control.icon.alpha = 0.8;
		} else {
			control.icon.tint = 0xffffff;
		}
	} else if (control.wall.document.door === CONST.WALL_DOOR_TYPES.SECRET) {
		if (game.settings.get(CONSTANTS.MODULE_NAME, "highlightSecretDoors")) {
			control.icon.tint = CONSTANTS.SECRET_DOOR_TINT;
		} else {
			if (doorColorShowOnlyGM && !game.user?.isGM) {
				control.icon.tint = 0xffffff;
			} else if (doorColor) {
				control.icon.tint = foundry.utils.colorStringToHex(doorColor);
				control.icon.alpha = 0.8;
			} else {
				control.icon.tint = 0xffffff;
			}
		}
	}
}
