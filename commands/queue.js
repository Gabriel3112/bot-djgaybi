const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { pagination } = require("reconlx");
module.exports = {
  data: new SlashCommandBuilder().setName("queue").setDescription("Show queue"),
  async execute(interaction) {
    const { client, guild } = interaction;
    const player = await client.manager.get(guild.id);
    const channel = client.channels.cache.get(player.textChannel);
    const queue = player.queue;

    let tracksPerPages = 10;
    let totalTracks = queue.size;
    let totalPages = totalTracks / tracksPerPages;
    let lastLengthPage = 0;
    let lengthPage = totalTracks >= 10 ? 0 : 10;

    const embeds = [];

    for (let i = 0; i < Math.round(totalPages) + 1; i++) {
      const embed = new MessageEmbed().setColor("BLUE");
      const tracks = queue.slice(lastLengthPage, lengthPage);
      if (queue.current) {
        embed.addField(
          "Tá tocando ",
          `[${queue.current.title}](${queue.current.uri})`
        );
      }
      if (i === 0) {
        embed.setTitle("Quer fila ? Então toma!");
      }

      if (totalTracks > 0) {
        embed.setDescription(
          tracks
            .map(
              (t, index) =>
                `${index + lastLengthPage + 1} - [${t.title}](${t.uri})`
            )
            .join("\n")
        );
        lastLengthPage = i * tracksPerPages; // 1:1 2:11 3:21
        if (tracksPerPages < totalTracks) {
          lengthPage = (i + 1) * tracksPerPages;
          if (lengthPage > totalTracks) {
            lengthPage = totalTracks;
          }
        }
      } else {
        embed.setDescription("Não tem música na fila meu parceiro.");
      }

      embeds.push(embed);
    }

    await pagination({
      embeds: embeds,
      channel: channel,
      author: interaction.user,
      time: 60000,
    });
  },
};
