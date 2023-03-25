import config from "../../config.js";
import colors from "colors";
import { log, error } from "../../utils/logging.js";
import { client } from "../../index.js";
import { readdirSync, statSync } from "fs";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { bansModel } from "../../database/schema.js";

export default {
	name: "ready",
	description: "client ready event",
	once: false,
	function: async function () {
		log(`Logged in as ${ colors.red(client.user.tag) }`);

		const checkExpiredBans = async () => {
			const bans = await bansModel.find();
			for (const ban of bans) {
				if (ban.expiresAt < Date.now()) {
					const guild = await client.guilds.fetch(ban.guild);
					await guild.members.unban(ban.id).catch(() => null);
					await bansModel.deleteOne({ user: ban.user, guild: ban.guild });
				}
			}
		}

		checkExpiredBans();
		setInterval(checkExpiredBans, 60000);

		const commands = [];
		const registerDir = async (dirName) => {
			const COMMAND_DIR = `./src/${dirName}`;
			const readDir = async (dir) => {
				const files = readdirSync(dir);
				for await (const file of files) {
					if (statSync(`${dir}/${file}`).isDirectory()) await readDir(`./${dir}/${file}`);
					else {
						const command = (await import(`../../../${dir}/${file}`)).default;
						if (command?.name) {
							commands.push({
								name: command.name,
								description: command.description,
								options: command.options,
							});
							log(`${dir}/${file} has been registered!`);
						} else {
							error(`${dir}/${file} has no name!`);
						}
					}
				}
			}
			await readDir(COMMAND_DIR)
		};

		await registerDir("slashCommands");
		
		const rest = new REST({ version: '10' }).setToken(config.token);
		rest
			.put(Routes.applicationCommands(client.user.id), { body: commands })
			.then(() => log('Commands have been registered successfully!'))
			.catch((err) => console.log(err));
	}
};