/* eslint-disable no-unused-vars */
// import { client } from "../index.js";

export default {
	name: "test",
	aliases: ["t"],
	description: "testing",
	permissions: ["Administrator"],
	roleRequired: "", // id here
	cooldown: 0, // in ms
	function: async function ({ message, args }) {
        const { client } = await import("../index.js");
		message.channel.send("HeLlo!");
	}
};