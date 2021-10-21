const { getVoiceConnection } = require("@discordjs/voice");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { queue } = require("../util/queue");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop and disconnect bot on channel."),
  async execute(interaction) {
    const { client, guild } = interaction;
    const player = client.manager.get(guild.id);

    try {
      player.queue.clear();
      player.destroy();
      await interaction.reply(
        `Pediu para parar parou! Quem pediu foi \` ${interaction.user.username}#${interaction.user.discriminator}\`.`
      );
    } catch (e) {
      interaction.reply("Deu problema aqui pae.");
    }
  },
};
