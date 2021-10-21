const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Search and start play music")
    .addStringOption((option) =>
      option
        .setName("music")
        .setDescription("link or name for music")
        .setRequired(true)
    ),

  async execute(interaction) {
    const { client, member } = interaction;
    const { channel } = member.voice;

    if (!channel)
      return interaction.reply({
        content: "Entre em um canal de voz primeiro.",
      });

    const player = client.manager.create({
      guild: interaction.guild.id,
      voiceChannel: interaction.member.voice.channel.id,
      textChannel: interaction.channel.id,
    });

    const search = interaction.options.getString("music");

    let result;
    try {
      result = await client.manager.search(search, interaction.user);

      switch (result.loadType) {
        case "NO_MATCHES":
          interaction.reply({
            content: `Eu não achei esse diacho \`${search}\`.`,
          });
        case "PLAYLIST_LOADED":
          result.tracks.map((m) => player.queue.add(m));
          interaction.reply({
            content: `Acabei de colocar a playlist \`${result.playlist.name}\` na fila.`,
          });
        case "SEARCH_RESULT":
          player.queue.add(result.tracks[0]);
          interaction.reply({
            content: `Acabei de colocar a música \`${result.tracks[0].title}\` na fila.`,
          });
      }
    } catch (err) {
      console.log(err);
    }

    if (player.state !== "CONNECTED") {
      player.setEQ({ band: 2, gain: 0.1 });
      player.connect();
      interaction.reply({
        content: `Tá tocando \`${result.tracks[0].title}\` e quem pediu foi \`${interaction.user.username}#${interaction.user.discriminator}\`.`,
      });
    }

    if (!player.playing) player.play();
  },
};
