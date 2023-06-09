import {
    ActionRowBuilder,
  } from "discord.js";
  
  /**
   * Creates a pagination embed
   * @param {Message} interaction
   * @param {EmbedBuilder[]} pages
   * @param {ButtonBuilder[]} buttonList
   * @param {number} timeout
   * @returns
   */
  const paginationEmbed = async (
    interaction,
    pages,
    buttonList,
    timeout = 120000,
    dm = null
  ) => {
    if (!interaction && !interaction.reply) throw new Error("Channel is inaccessible.");
    if (!pages) throw new Error("Pages are not given.");
    if (!buttonList) throw new Error("Buttons are not given.");
    if (buttonList[0].style === "Link" || buttonList[1].style === "Link")
      throw new Error(
        "Link buttons are not supported with discordjs-button-pagination"
      );
    if (buttonList.length !== 2) throw new Error("Need two buttons.");
  
    let page = 0;
  
    if (pages.length === 1) {
      if (!dm) {
        return await interaction.reply({
          embeds: [pages[0].setFooter({ text: `Page ${page + 1} / ${pages.length}` })]
        });
      } else {
        return await interaction.user.send({
          embeds: [pages[0].setFooter({ text: `Page ${page + 1} / ${pages.length}` })]
        });
      }
    }
  
    const row = new ActionRowBuilder().addComponents(buttonList);
    
    let curPage;
    if (!dm) {
      curPage = await interaction.reply({
        embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
        components: [row]
      });
    } else {
      curPage = await interaction.user.send({
        embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
        components: [row]
      }).catch(() => {});
    }

    if (!curPage) return interaction.followUp({ content: ":x: **Cannot DM you please make sure you have private message enabled!**" });
  
    const filter = (i) =>
      i.custom_id === buttonList[0].custo_id ||
      i.custom_id === buttonList[1].custom_id;
  
    const collector = await curPage.createMessageComponentCollector({
      filter,
      time: timeout,
    });
  
    collector.on("collect", async (i) => {
      switch (i.customId) {
        case buttonList[0].data.custom_id:
          page = page > 0 ? --page : pages.length - 1;
          break;
        case buttonList[1].data.custom_id:
          page = page + 1 < pages.length ? ++page : 0;
          break;
        default:
          break;
      }
      await i.deferUpdate();
      await i.editReply({
        embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
        components: [row],
      });
      collector.resetTimer();
    });
  
    collector.on("end", () => {
      if (curPage.editable) {
        const disabledRow = new ActionRowBuilder().addComponents(
          buttonList[0].setDisabled(true),
          buttonList[1].setDisabled(true)
        );
        curPage.edit({
          embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
          components: [disabledRow],
        });
    }
  });
  
    return curPage;
  };
  export default paginationEmbed;