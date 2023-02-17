import CONSTANTS from "../constants.js";
import { getBackgroundColor } from "../lib/lib.js";
import * as Util from "../util.js";

// Inject settings for synchronized doors
/*
export function onRederWallConfig(wallConfig, html, data) {
	if (game.settings.get(CONSTANTS.MODULE_NAME, "synchronizedDoors") && data.data.door) {
		// Inject settings
		const synchronizedSettings = `
			<p class="notes">${game.i18n.localize(`${CONSTANTS.MODULE_NAME}.ui.synchronizedDoors.description`)}</p>
			<div class="form-group">
				<label for="synchronizationGroup">${game.i18n.localize(
					`${CONSTANTS.MODULE_NAME}.ui.synchronizedDoors.groupName`
				)}</label>
				<input type="text" name="synchronizationGroup"/>
			</div>
			<div class="form-group">
				<label for="synchronizeSecretStatus">${game.i18n.localize(
					`${CONSTANTS.MODULE_NAME}.ui.synchronizedDoors.synchronizeSecretStatus`
				)}</label>
				<input type="checkbox" name="synchronizeSecretStatus" value="true"/>
			</div>
			<div class="form-group">
				<label for="synchronizationGroupDoorColor">${game.i18n.localize(
					`${CONSTANTS.MODULE_NAME}.settings.synchronizationGroupDoorColor`
				)}</label>
				<input type="color" name="synchronizationGroupDoorColor" value="0xffffff"/>
			</div>
			<div class="form-group">
				<label for="synchronizationGroupDoorColorShowOnlyGM">${game.i18n.localize(
					`${CONSTANTS.MODULE_NAME}.settings.synchronizationGroupDoorColorShowOnlyGM`
				)}</label>
				<input type="checkbox" name="synchronizationGroupDoorColorShowOnlyGM" value="false"/>
			</div>
		`;
		html.find(".form-group").last().after(synchronizedSettings);

		const smartdoorsData = data.object.flags[CONSTANTS.MODULE_NAME];
		// Fill the injected input fields with values
		const input = (name) => html.find(`input[name="${name}"]`); // input is a helper function to search for a input field by it's name
		input("synchronizationGroup").prop("value", smartdoorsData?.synchronizationGroup);
		input("synchronizeSecretStatus").prop("checked", smartdoorsData?.synchronizeSecretStatus);
		input("synchronizationGroupDoorColor").prop("value", smartdoorsData?.synchronizationGroupDoorColor);
		input("synchronizationGroupDoorColorShowOnlyGM").prop(
			"checked",
			smartdoorsData?.synchronizationGroupDoorColorShowOnlyGM
		);

		// Recalculate config window height
		wallConfig.setPosition({ height: "auto" });
	}
}
*/
// Store our custom data from the WallConfig dialog
export async function onWallConfigUpdate(event, formData) {
	const synchronizeSecretStatus = formData.synchronizeSecretStatus;
	const updateData = {
		flags: {
			[CONSTANTS.MODULE_NAME]: {
				synchronizationGroup: formData.synchronizationGroup,
				synchronizationGroupDoorColor: formData.synchronizationGroupDoorColor,
				synchronizationGroupDoorColorShowOnlyGM: formData.synchronizationGroupDoorColorShowOnlyGM,
			},
		},
	};
	let ids = this.editTargets;
	if (ids.length == 0) {
		ids = [this.object.id];
	}

	// If a synchronization group is set, get the state of existing doors and assume their state
	if (formData.synchronizationGroup) {
		// Update the synchronizeSecretStatus flag
		//@ts-ignore
		updateData.flags[CONSTANTS.MODULE_NAME].synchronizeSecretStatus = synchronizeSecretStatus;

		// Search for other doors in the synchronization group that aren't in the list of edited doors
		const doorInGroup = Util.findInAllWalls((wall) => {
			// We only search for doors
			if (!wall.door) {
				return false;
			}
			// We only want doors in the same synchronization group
			if (wall.flags[CONSTANTS.MODULE_NAME]?.synchronizationGroup !== formData.synchronizationGroup) {
				return false;
			}
			// Doors on this scene that have their id included in `ids` are currently being changed. Ignore them.
			if (wall.parent.id === canvas.scene?.id && ids.includes(wall.id)) {
				return false;
			}
			return true;
		});
		if (doorInGroup) {
			// ds is the door sate in foundry
			//@ts-ignore
			updateData.ds = doorInGroup.ds;

			if (synchronizeSecretStatus) {
				// door is the door type in foundry
				//@ts-ignore
				updateData.door = doorInGroup.door;
			}
		}
	}

	// Update all the edited walls
	const updateDataset = ids.map((id) => {
		return { _id: id, ...updateData };
	});
	const updateResult = await canvas.scene?.updateEmbeddedDocuments("Wall", updateDataset);

	// If door is synchronized, synchronize secret status among synchronized doors
	if (formData.synchronizationGroup) await updateSynchronizedDoors(updateData, formData.synchronizationGroup);

	return updateResult;
}

// Update the state of all synchronized doors
export function onDoorLeftClick() {
	const state = this.wall.document.ds;
	const states = CONST.WALL_DOOR_STATES;

	// Check if this feature is enabled
	if (!game.settings.get(CONSTANTS.MODULE_NAME, "synchronizedDoors")) return false;

	const synchronizationGroup = this.wall.document.flags[CONSTANTS.MODULE_NAME]?.synchronizationGroup;

	// Does this door have a synchronization group? If not there is nothing to do
	if (!synchronizationGroup) return false;

	// If the door is locked there is nothing to synchronize
	if (state === states.LOCKED) return false;

	// Calculate new door state
	const newstate = state === states.CLOSED ? states.OPEN : states.CLOSED;

	// Update all doors belonging to the synchronization group
	const updateData = { ds: newstate };
	updateSynchronizedDoors(updateData, synchronizationGroup);

	return true;
}

export function onDoorRightClick() {
	const state = this.wall.document.ds;
	const states = CONST.WALL_DOOR_STATES;

	// Check if this feature is enabled
	if (!game.settings.get(CONSTANTS.MODULE_NAME, "synchronizedDoors")) {
		return false;
	}
	const synchronizationGroup = this.wall.document.flags[CONSTANTS.MODULE_NAME]?.synchronizationGroup;

	// Does this door have a synchronization group? If not there is nothing to do
	if (!synchronizationGroup) {
		return false;
	}
	// Only the gm is allowed to lock/unlock doors
	if (!game.user?.isGM) {
		return false;
	}
	// If the door is currently opened we cannot lock the door
	if (state === states.OPEN) {
		return false;
	}
	// Calculate new door state
	const newstate = state === states.LOCKED ? states.CLOSED : states.LOCKED;

	// Update all doors belonging to the synchronization group
	const updateData = { ds: newstate };
	updateSynchronizedDoors(updateData, synchronizationGroup);

	return true;
}

// Updates all doors in the specified synchronization group with the provided data
export function updateSynchronizedDoors(updateData, synchronizationGroup) {
	// Search for doors belonging to the synchronization group in all scenes
	let scenes = Util.filterAllWalls(
		(wall) => wall.door && wall.flags[CONSTANTS.MODULE_NAME]?.synchronizationGroup === synchronizationGroup
	);
	const doorColorSynchronizationGroup = game.user?.isGM ? getBackgroundColor(synchronizationGroup) : null;

	// Update all doors in the synchronization group
	return Promise.all(
		scenes.map((scene) =>
			scene.scene.updateEmbeddedDocuments(
				"Wall",
				scene.walls.map((wall) => {
					if (doorColorSynchronizationGroup) {
						return {
							_id: wall.id,
							icon: {
								tint: foundry.utils.colorStringToHex(doorColorSynchronizationGroup),
								alpha: 0.8,
							},
							...updateData,
						};
					} else {
						return {
							_id: wall.id,
							...updateData,
						};
					}
				})
			)
		)
	);
}

