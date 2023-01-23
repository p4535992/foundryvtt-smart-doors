import CONSTANTS from "../constants.js";
import { warn } from "../lib/lib.js";

// Tint all secret doors dark grey
export function onCanvasReady(currentCanvas) {
	if (game.settings.get(CONSTANTS.MODULE_NAME, "highlightSecretDoors")) {
		// const types = CONST.WALL_DOOR_TYPES;
		const secretDoors = <PIXI.DisplayObject[]>canvas.controls?.doors.children.filter(
			//@ts-ignore
			(control) => control.wall.door == CONST.WALL_DOOR_TYPES.SECRET
		);
		//@ts-ignore
		secretDoors.forEach((control) => (control.icon.tint = CONSTANTS.SECRET_DOOR_TINT));
	}
}

// If door type has been changed, tint the door accordingly
export function onUpdateWall(wall, update, options) {
	if (!game.settings.get(CONSTANTS.MODULE_NAME, "highlightSecretDoors")) {
		return;
	}
	// const types = CONST.WALL_DOOR_TYPES;
	if (wall.door === CONST.WALL_DOOR_TYPES.NONE) {
		return;
	}
	// Find the door control corresponding to the changed door
	//@ts-ignore
	const changedDoor = canvas.controls?.doors.children.find((control) => control.wall.id === wall.id);
	// If the changed door doesn't have a control it's not on this scene - ignore it
	if (!changedDoor) return;
	// The wall object we got passed might be from another scene so we replace it with the door from the current scene
	//@ts-ignore
	wall = changedDoor.wall;
	const doorColor = wall.getFlag(CONSTANTS.MODULE_NAME, "doorColor");
	const doorColorShowOnlyGM = wall.getFlag(CONSTANTS.MODULE_NAME, "doorColorShowOnlyGM");
	if (wall.door === CONST.WALL_DOOR_TYPES.DOOR) {
		if (doorColorShowOnlyGM && !game.user?.isGM) {
			//@ts-ignore
			changedDoor.icon.tint = 0xffffff;
		} else if (doorColor) {
			//@ts-ignore
			changedDoor.icon.tint = foundry.utils.colorStringToHex(doorColor);
			//@ts-ignore
			changedDoor.icon.alpha = 0.8;
		} else {
			//@ts-ignore
			changedDoor.icon.tint = 0xffffff;
		}
	} else if (wall.door === CONST.WALL_DOOR_TYPES.SECRET) {
		if (game.settings.get(CONSTANTS.MODULE_NAME, "highlightSecretDoors")) {
			//@ts-ignore
			changedDoor.icon.tint = CONSTANTS.SECRET_DOOR_TINT;
		} else {
			if (doorColorShowOnlyGM && !game.user?.isGM) {
				//@ts-ignore
				changedDoor.icon.tint = 0xffffff;
			} else if (doorColor) {
				//@ts-ignore
				changedDoor.icon.tint = foundry.utils.colorStringToHex(doorColor);
				//@ts-ignore
				changedDoor.icon.alpha = 0.8;
			} else {
				//@ts-ignore
				changedDoor.icon.tint = 0xffffff;
			}
		}
	} else {
		warn(`Encountered unknown door type ${wall.door} while highlighting secret doors.`);
	}
}
