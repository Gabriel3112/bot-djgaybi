const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  joinVoiceChannel,
  createAudioResource,
  createAudioPlayer,
  VoiceConnectionDisconnectReason,
  VoiceConnectionStatus,
  entersState,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const { queue, queueConstructor } = require("../util/queue");
const audioPlayer = require("../util/player");
const player = createAudioPlayer();

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
    const { channel } = interaction.member.voice;

    if (!channel)
      return await interaction.reply({
        content: "Entre em um canal de voz primeiro.",
      });

    const search = interaction.options.getString("music");

    const serverQueue = queue.get(interaction.guild.id);

    let song = {};
    song = await videoFinder(search, interaction);
    if (!serverQueue) {
      queue.set(interaction.guild.id, queueConstructor);
      queueConstructor.channel = channel;
      queueConstructor.textChannel = interaction.channel;
      queueConstructor.songs.push(song);
      await interaction.reply({
        content: `${song.title} => adicionada a lista.`,
      });
      queueConstructor.player = player;
      try {
        const connection = await voiceState(channel);
        connection.subscribe(player);
        queueConstructor.connection = connection;

        audioPlayer(interaction.guild, queueConstructor.songs[0]);
      } catch (error) {
        queue.delete(interaction.guild.id);
        await interaction.reply({ content: "Erro ao connectar!" });
        throw error;
      }
    } else {
      serverQueue.songs.push(song);
      await interaction.reply({
        content: `${song.title} => adicionada a lista.`,
      });
    }
  },
};

const voiceState = async (channel) => {
  const connection = await joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  connection.on(
    VoiceConnectionStatus.Disconnected,
    async (oldState, newState) => {
      if (
        newState.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
        newState.closeCode === 4014
      ) {
        try {
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
          ]);
        } catch {
          connection.destroy();
        }
      }
    }
  );
  return connection;
};

const videoFinder = async (query, interaction) => {
  if (ytdl.validateURL(query)) {
    const songInfo = await ytdl.getInfo(query);
    return {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
    };
  } else {
    const search = await ytSearch(query);
    const video = search.videos.length > 1 ? search.videos[0] : null;
    if (video) {
      return { title: video.title, url: video.url };
    } else {
      await interaction.reply({ content: "Música não encontrada!" });
    }
  }
};
