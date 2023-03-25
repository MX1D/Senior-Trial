import colors from "colors";
import { log } from "../../utils/logging.js";
import { EmbedBuilder, InteractionType, PermissionsBitField } from "discord.js";
import { client } from "../../index.js";

export default {
	name: "interactionCreate",
	description: "client on interaction create event, using for slash commands",
	once: false,
	function: async function (interaction) {
		if (interaction.type !== InteractionType.ApplicationCommand) return;
        if (interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand()) return;
		const cmd = interaction.commandName;
		const command = client.slashCommands.get(cmd);
		if (command) {
			if (command.permissions) {
				const invalidPerms = [];
				for (const perm of command.permissions) {
					if (!interaction.member.permissions.has(PermissionsBitField.Flags[perm])) invalidPerms.push(perm);
				}
				if (invalidPerms.length) return interaction.reply({ content: `Missing Permissions: \`${ invalidPerms + "".replace(/,/g, ", ") }\`` });
			}
			if (command.roleRequired) {
				const role = await interaction.guild.roles.fetch(command.roleRequired);
				if (!interaction.member.roles.cache.has(role.id) && interaction.member.roles.highest.comparePositionTo(role) < 0 && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply(`:x: **You don't have the required role!**`);
			}
			if (client.cooldowns.find((a) => a.command == command.name && a.user == interaction.user.id)) {
				const embed = new EmbedBuilder()
					.setColor("#FF0000")
					.setTitle("Cooldown")
					.setDescription(`:x: **You can use this command again <t:${ client.cooldowns.find((a) => a.command == command.name && a.user == interaction.user.id).until }:R>**`)
					.setTimestamp()
					.setFooter({ text: interaction.user.username, icon_url: interaction.user.avatarURL() });
				return interaction.reply({ embeds: [embed] });
			}
			const { options } = interaction;
			command.function({ client, interaction, options });
			log(`[Command ran] ${ interaction.commandName } ${ colors.blue("||") } Author: ${ interaction.user.username } ${ colors.blue("||") } ID: ${ interaction.user.id } ${ colors.blue("||") } Server: ${ interaction.guild.name }`); // logging that there is a command that just ran
			if (command.cooldown && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				client.cooldowns.push({ user: interaction.user.id, command: command.name, until: Math.round((Date.now() + command.cooldown) / 1000) });
				setTimeout(() => {
					client.cooldowns.splice(client.cooldowns.indexOf(client.cooldowns.find((a) => a.user === interaction.user.id && a.command === command.name)), 1);
				}, command.cooldown);
			}
		}
	}
};