import CONSTANTS from "./constants";
import API from "./api";
import { debug } from "./lib/lib";
import { setSocket } from "../main";

export let smartDoorsSocket;

export function registerSocket() {
	debug("Registered smartDoorsSocket");
	if (smartDoorsSocket) {
		return smartDoorsSocket;
	}
	//@ts-ignore
	smartDoorsSocket = socketlib.registerModule(CONSTANTS.MODULE_NAME);

	setSocket(smartDoorsSocket);
	return smartDoorsSocket;
}
