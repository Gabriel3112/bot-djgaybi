const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("skip now music"),
  async execute(interaction) {
    const { client } = interaction;

    const player = client.manager.get(interaction.guild.id);
    player.stop();

    return interaction.reply({
      content: `Quem pulou a Música foi \`${interaction.user.username}#${interaction.user.discriminator}\`.`,
    });
  },
};
