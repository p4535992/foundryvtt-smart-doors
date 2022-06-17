import {SMART_DOOR_FLAG, settingsKey} from "../settings.js"

// Set the size of all door controls in relation to the grid size so it'll have a constant percieved size
export function onCanvasReady(currentCanvas) {
	const doors = currentCanvas.controls.doors.children
	doors.forEach((control) => fixDoorControlColor(control))
}

// Set the size of the door control in relation to the grid size so it'll have a constant percieved size
export function onDoorControlPostDraw() {
	// If the canvas isn't ready we'll do this after the "canvasReady" event is fired instead
	if (!canvas.ready) return

	fixDoorControlColor(this)
}

// Resizes the door control according to the grid size
function fixDoorControlColor(control) {
	const doorColor = control.wall.getFlag(SMART_DOOR_FLAG, "doorColor")
	const doorColorShowOnlyGM = wall.getFlag(SMART_DOOR_FLAG, "doorColorShowOnlyGM")
	if (control.wall.door === types.DOOR) {
		if (doorColorShowOnlyGM && !game.user.isGM) {
			control.icon.tint = 0xffffff
		} else if (doorColor) {
			control.icon.tint = foundry.utils.colorStringToHex(doorColor)
			control.icon.alpha = 0.8
		} else {
			control.icon.tint = 0xffffff
		}
	} else if (control.wall.door === types.SECRET) {
		if (game.settings.get(settingsKey, "highlightSecretDoors")) {
			control.icon.tint = SECRET_DOOR_TINT
		} else {
			if (doorColorShowOnlyGM && !game.user.isGM) {
				control.icon.tint = 0xffffff
			} else if (doorColor) {
				control.icon.tint = foundry.utils.colorStringToHex(doorColor)
				control.icon.alpha = 0.8
			} else {
				control.icon.tint = 0xffffff
			}
		}
	}
}
