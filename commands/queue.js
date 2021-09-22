const { SlashCommandBuilder } = require("@discordjs/builders");
const { queue } = require("../util/queue");

module.exports = {
  data: new SlashCommandBuilder().setName("queue").setDescription("Show queue"),
  async execute(interaction) {
    const { songs } = queue.get(interaction.guild.id);
    let list = "Fila: \n";
    let i = 0;
    songs.map(({ title }) => {
      list = list + i + " : " + title + "\n";
      i++;
    });
    interaction.reply({ content: list });
  },
};
