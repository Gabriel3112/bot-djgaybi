const { getVoiceConnection } = require("@discordjs/voice");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { queue } = require("../util/queue");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop and disconnect bot on channel."),
  async execute(interaction) {
    const connection = await getVoiceConnection(interaction.guild.id);

    try {
      queue.delete(interaction.guild.id);
      connection.destroy();
      interaction.reply("Vou sair que estou com sono, okay ?");
    } catch {
      interaction.reply("Deu problema aqui pae.");
    }
  },
};
