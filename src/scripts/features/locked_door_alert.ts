import CONSTANTS from "../constants";

// Tint the source door red when a locked alert is hovered
export function onRenderChatMessage(message, html, data) {
	// Tint the door that generated this message
	const source = message.flags[CONSTANTS.MODULE_NAME]?.source;
	if (!source) {
		return;
	}
	// Tint on mouse enter
	const mouseEnter = function () {
		const sourceDoor = canvas.controls?.doors.children.find(
			//@ts-ignore
			(door) => door.wall.id === source.wall && door.wall.scene.id === source.scene
		);
		if (sourceDoor) {
			//@ts-ignore
			sourceDoor.icon.tint = 0xff0000;
		}
	};
	html.on("mouseenter", mouseEnter);

	// Remove tint on mouse leave
	const mouseLeave = function () {
		const sourceDoor = canvas.controls?.doors.children.find(
			//@ts-ignore
			(door) => door.wall.id === source.wall && door.wall.scene.id === source.scene
		);

		if (sourceDoor) {
			//@ts-ignore
			sourceDoor.icon.tint = 0xffffff;
		}
	};
	html.on("mouseleave", mouseLeave);

	// Localize the message
	html.find(".message-content")[0].innerText = game.i18n.localize(`${CONSTANTS.MODULE_NAME}.ui.lockedDoorAlert`);
}

// Creates a chat message stating that a player tried to open a locked door
export function onDoorLeftClick() {
	// Check if this feature is enabled
	if (!game.settings.get(CONSTANTS.MODULE_NAME, "lockedDoorAlert")) {
		return false;
	}
	const state = this.wall.document.ds;
	const states = CONST.WALL_DOOR_STATES;

	// Only create messages when the door is locked.
	if (state !== states.LOCKED) {
		return false;
	}
	// Generate no message if the gm attempts to open the door
	if (game.user?.isGM) {
		return false;
	}
	// Create and send the chat message
	const message = <any>{};
	message.user = game.user?.id;
	if (game.user?.character) {
		message.speaker = { actor: game.user?.character };
	}
	message.content = game.i18n.localize(`${CONSTANTS.MODULE_NAME}.ui.lockedDoorAlert`);
	message.sound = CONFIG.sounds.lock;
	message.flags = {
        [CONSTANTS.MODULE_NAME]:
            {
                source: {
                    wall: this.wall.id, scene: this.wall.scene.id
                }
            }
    };
	ChatMessage.create(message);
	return true;
}
