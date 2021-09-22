const { SlashCommandBuilder } = require("@discordjs/builders");
const { queue } = require("../util/queue");
const audioPlayer = require("../util/player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("skip now music"),
  async execute(interaction) {
    const { songs } = await queue.get(interaction.guild.id);
    console.log(songs);
    try {
      songs.shift();
      audioPlayer(interaction.guild, songs[0]);
      await interaction.reply({ content: "Já troquei de música, eu hein" });
    } catch (error) {
      console.log(error);
    }
  },
};
