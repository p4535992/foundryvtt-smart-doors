export const SMART_DOOR_MODULE_NAME = 'smart-doors';
export const SMART_DOOR_FLAG = 'smartdoors';
function reloadGM() {
  if (game.user.isGM) location.reload();
}

export function registerSettings() {
  game.settings.register(SMART_DOOR_MODULE_NAME, 'dataVersion', {
    scope: 'world',
    config: false,
    type: String,
    default: 'fresh install',
  });
  game.settings.register(SMART_DOOR_MODULE_NAME, 'doorControlSizeFactor', {
    name: 'smart-doors.settings.doorControlSizeFactor.name',
    hint: 'smart-doors.settings.doorControlSizeFactor.hint',
    scope: 'client',
    config: true,
    type: Number,
    default: 1.5,
    onChange: () => location.reload(),
  });
  game.settings.register(SMART_DOOR_MODULE_NAME, 'highlightSecretDoors', {
    name: 'smart-doors.settings.highlightSecretDoors.name',
    hint: 'smart-doors.settings.highlightSecretDoors.hint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
    onChange: reloadGM,
  });
  game.settings.register(SMART_DOOR_MODULE_NAME, 'toggleSecretDoors', {
    name: 'smart-doors.settings.toggleSecretDoors.name',
    hint: 'smart-doors.settings.toggleSecretDoors.hint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });
  game.settings.register(SMART_DOOR_MODULE_NAME, 'lockedDoorAlert', {
    name: 'smart-doors.settings.lockedDoorAlert.name',
    hint: 'smart-doors.settings.lockedDoorAlert.hint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });
  game.settings.register(SMART_DOOR_MODULE_NAME, 'synchronizedDoors', {
    name: 'smart-doors.settings.synchronizedDoors.name',
    hint: 'smart-doors.settings.synchronizedDoors.hint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });
	game.settings.register(SMART_DOOR_MODULE_NAME, 'useColorSynchronizedDoors', {
    name: 'smart-doors.settings.useColorSynchronizedDoors.name',
    hint: 'smart-doors.settings.useColorSynchronizedDoors.hint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });
}
