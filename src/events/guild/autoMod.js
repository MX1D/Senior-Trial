import { client } from "../../index.js";
import config from "../../config.js";
import { userModel } from "../../database/schema.js";
import ms from "ms";
import { error } from "../../utils/logging.js";
import { EmbedBuilder, PermissionsBitField } from "discord.js";

export default {
    name: "messageCreate",
    once: false,
    function: async function (message) {
        if (message.author.bot) return;
        if (message.member.roles.cache.some(role => config.autoMod.whitelistedRoles.includes(role.id)) || message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        if (config.autoMod.regexes.some(regex => regex.test(message.content.toLowerCase()))) {
            await message.delete();
            const user = await client.users.fetch(message.author.id);
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
                reason: "Bad word",
                message: message.content,
                moderator: client.user.id,
                date: Date.now()
            });

            const logsChannel = await client.channels.fetch(config.autoMod.logsChannel).catch(() => null);
            if (logsChannel) {
                const embed = new EmbedBuilder()
                    .setTitle("Auto mod")
                    .setDescription(`**User:** <@${user.id}> - ${user.tag} (${user.id})\n**Reason:** Bad word\n**Message:** \`\`\`${message.content}\`\`\``)
                    .setColor("#ff0000")
                    .setTimestamp();

                await logsChannel.send({ embeds: [embed] });
            }

            if (userDB.warns.length >= config.autoMod.maxWarns) {
                userDB.history.push({
                    punishment: config.autoMod.punishment,
                    reason: "Auto mod",
                    moderator: client.user.id,
                    date: Date.now()
                });
                if (config.autoMod.punishment === "ban") {
                    await message.guild.members.ban(user.id, { reason: "Auto mod" }).catch(() => {
                        error("Failed to ban user, probably missing permissions.");
                    });
                } else if (config.autoMod.punishment === "kick") {
                    await message.guild.members.kick(user.id, "Auto mod").catch(() => {
                        error("Failed to kick user, probably missing permissions.");
                    });
                } else if (config.autoMod.punishment === "mute") {
                    const length = ms(config.autoMod.muteLength).catch(() => {
                        error("Failed to timeout user, probably missing permissions.");
                    });
                    if (!length) return error("Invalid mute length");
                    await message.author.timeout(length, "Auto mod");
                }
                if (logsChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle("Auto mod")
                        .setDescription(`**User:** <@${user.id}> - ${user.tag} (${user.id})\n**Reason:** Auto mod\n**Punishment:** ${config.autoMod.punishment}\n**Warns:** ${userDB.warns.length}`)
                        .setColor("#ff0000")
                        .setTimestamp();

                    await logsChannel.send({ embeds: [embed] });
                }
                if (config.autoMod.resetWarns) userDB.warns = [];
            }
            await userDB.save();
        }
    }
}