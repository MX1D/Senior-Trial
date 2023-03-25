import colors from "colors";
import { log } from "../../utils/logging.js";
import { client } from "../../index.js";

export default {
    name: "interactionCreate",
    once: false,
    function: async function (interaction) {
        if (!interaction.isModalSubmit()) return;
        const modal = client.modals.get(interaction.customId);
        if (!modal) return;
        log(`[Modal Submitted] ${ interaction.customId } ${ colors.blue("||") } Author: ${ interaction.user.username } ${ colors.blue("||") } ID: ${ interaction.user.id } ${ colors.blue("||") } Server: ${ interaction.guild.name }`);
        modal.function({ client, interaction });
    }
}