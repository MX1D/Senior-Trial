/* eslint-disable no-unused-vars */
import { ApplicationCommandOptionType  } from "discord.js";
import { userModel } from "../database/schema.js";

export default {
	name: "warn",
	description: "Warn a user",
	permissions: ["ManageMembers"],
	options: [{ name: "user", description: "The user to warn", type: ApplicationCommandOptionType.User, required: true }, { name: "reason", description: "The reason for the warn", type: ApplicationCommandOptionType.String, required: true }],
	function: async function ({ interaction, options }) {
        const user = options.getUser("user");
        const reason = options.getString("reason");

        const member = await interaction.guild.members.fetch(user.id);
        if (!member) return interaction.reply({ content: ":x: **I couldn't find that user in the server!**" });

        let userDB = await userModel.findOne({ id: user.id });
        if (!userDB) {
            userDB = new userModel({
                id: user.id,
                warns: [],
                history: []
            });
            await userDB.save();
        }

        userDB.warns.push({
            reason: reason,
            message: "N/A",
            moderator: interaction.user.id,
            date: Date.now()
        });

        await userDB.save();

        interaction.reply({ content: `:white_check_mark: **Warned ${user.tag} for \`${reason}\`**` });
	}
};