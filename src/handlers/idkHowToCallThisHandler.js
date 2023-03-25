import fs from "fs";
import { client } from "../index.js";
import { Collection } from "discord.js";

export default {
	/**
	 * @description Registers all the commands, context menus, buttons, modals and select menus
	 * @author tako
	 * 
	 * Also, I'm sure this is the worst way to do this, but it works
	 */
	init: async function () {
		const dirs = ["commands", "slashCommands", "contextMenus", "buttons", "modals", "selectMenus"];
		for (const dir of dirs) {
			await register(dir);
		}
	}
};

/**
 * @param { String } dir - The directory to register
 */
async function register(dir) {
	const files = fs.readdirSync(`./src/${dir}/`);
	client[dir] = new Collection();

	for (const file of files) {
		if (file.endsWith(".js")) {
			const thing = (await import(`../${dir}/${file}`)).default;
			if (!thing) continue;
			let thing2;
			switch (dir) {
				case "commands":
				case "slashCommands":
				case "contextMenus":
					thing2 = thing.name;
					break;
				case "buttons":
				case "modals":
				case "selectMenus":
					thing2 = thing.id;
					break;
				default:
					throw new Error(`Directory ${dir} is not valid.`);
			}
			if (thing2 === undefined) throw new Error(`No name or id found for ${dir}/${file}. Did I maybe mess up?`);
			client[dir].set(thing2, thing);

		} else if (fs.statSync(`./src/${dir}/${file}`).isDirectory()) {
			fs.readdirSync(`./src/${dir}/${file}`).forEach(async file2 => {
				if (file2.endsWith(".js")) {
					const thing = (await import(`../${dir}/${file}/${file2}`)).default;
					let thing2;
					switch (dir) {
						case "commands":
						case "contextMenus":
							thing2 = thing.name;
							break;
						case "buttons":
						case "modals":
						case "selectMenus":
							thing2 = thing.id;
							break;
						default:
							throw new Error(`Directory ${dir} is not valid.`);
					}

					if (thing2 === undefined) throw new Error(`No name or id found for ${dir}/${file}/${file2}. Did I maybe mess up?`);
					client[dir].set(thing2, thing);
				}
			});
			continue;
		}
	}
}