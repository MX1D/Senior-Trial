/* eslint-disable no-unused-vars */
import { ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, EmbedBuilder  } from "discord.js";
import { userModel } from "../database/schema.js";
import paginationEmbed from "../utils/pagination.js";

export default {
	name: "warns",
	description: "List a user's warns",
	permissions: ["ManageMembers"],
	options: [{ name: "user", description: "The user to warn", type: ApplicationCommandOptionType.User, required: true }],
	function: async function ({ interaction, options }) {
        const user = options.getUser("user");

        let userDB = await userModel.findOne({ id: user.id });
        if (!userDB) {
            userDB = new userModel({
                id: user.id,
                warns: [],
                history: []
            });
            await userDB.save();
        }

        const pages = [];
        
        for (let i = 0; i < userDB.warns.length; i += 1) {
            const warn = userDB.warns[i];
            const embed = new EmbedBuilder()
                .setTitle(`Warn ${i + 1}`)
                .setColor("#FF0000")
                .setDescription(`**Reason:** ${warn.reason}\n**Moderator:** <@${warn.moderator}>\n**Date:** <t:${Math.round(warn.date / 1000)}>`);

            pages.push(embed);
        }

        const buttons = [
            new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel("Previous").setCustomId("previous").setEmoji("⬅️"),
            new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel("Next").setCustomId("next").setEmoji("➡️")
        ];

        paginationEmbed(interaction, pages, buttons);
    }
};