/* eslint-disable no-unused-vars */
import { ApplicationCommandOptionType  } from "discord.js";
import { bansModel } from "../database/schema.js";
import ms from "ms";

export default {
	name: "ban",
	description: "Ban a member",
	permissions: ["BanMembers"],
	options: [{ name: "user", description: "The user to ban", type: ApplicationCommandOptionType.User, required: true }, { name: "reason", description: "The reason for the ban", type: ApplicationCommandOptionType.String, required: true }, { name: "length", description: "The length of the ban", type: ApplicationCommandOptionType.String, required: false }],
	function: async function ({ interaction, options }) {
        const user = options.getUser("user");
        const reason = options.getString("reason");

        const member = await interaction.guild.members.fetch(user.id);
        if (!member) return interaction.reply({ content: ":x: **I couldn't find that user in the server!**" });

        const length = options.getString("length");
        if (length) {
            if (isNaN(ms(length))) return interaction.reply({ content: ":x: **Invalid ban length!**" });
        }

        await member.ban({ reason: reason });

        const userDB = new bansModel({
            id: user.id,
            expiresAt: length ? Date.now() + ms(length) : null,
            guild: interaction.guild.id
        });

        await userDB.save();

        await interaction.reply({ content: `:white_check_mark: **Banned ${user.tag} for \`${reason}\`**${length ? ` for \`${length}\`` : ""}` });
	}
};