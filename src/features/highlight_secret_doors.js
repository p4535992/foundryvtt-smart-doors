import { SMART_DOOR_MODULE_NAME } from '../settings.js';

const SECRET_DOOR_TINT = 0x888888;

// Tint all secret doors dark grey
export function onCanvasReady(currentCanvas) {
  if (game.settings.get(SMART_DOOR_MODULE_NAME, 'highlightSecretDoors')) {
    const types = CONST.WALL_DOOR_TYPES;
    const secretDoors = canvas.controls.doors.children.filter((control) => control.wall.data.door == types.SECRET);
    secretDoors.forEach((control) => (control.icon.tint = SECRET_DOOR_TINT));
  }
}

// If door type has been changed, tint the door accordingly
export function onUpdateWall(scene, wall, update) {
  //wallDocument, data, options, userID
  const types = CONST.WALL_DOOR_TYPES;
  if (wall.door === types.NONE) {
    return;
  }

  // Find the door control corresponding to the changed door
  const changedDoor = canvas.controls.doors.children.find((control) => control.wall.data._id === wall._id);
  // If the changed door doesn't have a control it's not on this scene - ignore it
  if (!changedDoor) {
    return;
  }

  // if (!game.settings.get(settingsKey, 'highlightSecretDoors')){
  // 	return;
  // }
  const doorColor = wall.getFlag('smartdoors', 'doorColor');
	const doorColorShowOnlyGM = wall.getFlag('smartdoors', 'doorColorShowOnlyGM');
  // The wall object we got passed might be from another scene so we replace it with the door from the current scene
  wall = changedDoor.wall.data;
  if (wall.door === types.DOOR) {
		if(doorColorShowOnlyGM && !game.user.isGM){
			changedDoor.icon.tint = 0xffffff;
		}
    else if (doorColor) {
      changedDoor.icon.tint = foundry.utils.colorStringToHex(doorColor);
      changedDoor.icon.alpha = 0.8;
    } else {
      changedDoor.icon.tint = 0xffffff;
    }
  } else if (wall.door === types.SECRET) {
    if (game.settings.get(SMART_DOOR_MODULE_NAME, 'highlightSecretDoors')) {
      changedDoor.icon.tint = SECRET_DOOR_TINT;
    } else {
			if(doorColorShowOnlyGM && !game.user.isGM){
				changedDoor.icon.tint = 0xffffff;
			}
      else if (doorColor) {
        changedDoor.icon.tint = foundry.utils.colorStringToHex(doorColor);
        changedDoor.icon.alpha = 0.8;
      } else {
        changedDoor.icon.tint = 0xffffff;
      }
    }
  } else {
    console.warn('Smart Doors | Encountered unknown door type ' + wall.door + ' while highlighting secret doors.');
  }
}
