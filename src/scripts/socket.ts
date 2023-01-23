import CONSTANTS from "./constants";
import API from "./api";
import { debug } from "./lib/lib";
import { setSocket } from "../main";

export let goToOrPullPlayerSocket;

export function registerSocket() {
	debug("Registered goToOrPullPlayerSocket");
	if (goToOrPullPlayerSocket) {
		return goToOrPullPlayerSocket;
	}
	//@ts-ignore
	goToOrPullPlayerSocket = socketlib.registerModule(CONSTANTS.MODULE_NAME);

	goToOrPullPlayerSocket.register("pullPlayerToScene", (...args) => API.pullPlayerToSceneArr(...args));

	setSocket(goToOrPullPlayerSocket);
	return goToOrPullPlayerSocket;
}
