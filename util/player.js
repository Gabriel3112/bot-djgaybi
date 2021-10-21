const { createAudioResource, demuxProbe } = require("@discordjs/voice");
const ytdl = require("discord-ytdl-core");
const { queue } = require("../util/queue");

const audioPlayer = async (guild, song) => {
  const { player, songs, connection, textChannel } = queue.get(guild.id);
  try {
    if (!song) {
      connection.destroy();
      queue.delete(guild.id);
      return;
    }
    const stream = await ytdl(song.url, {
      filter: "audioonly",
      opusEncoded: true,
      encoderArgs: ["-af", "bass=g=12,dynaudnorm=f=200"],
    });

    if (!stream) return await textChannel.send({ content: `Deu pau aqui pae` });

    const resource = await createAudioResource(stream, { inputType: "opus" });
    stream.on("finish", () => {
      console.log(songs);
      songs.shift();
      console.log(songs);
      audioPlayer(guild, songs[0]);
    });

    stream.on("error", (error) => {
      audioPlayer(guild, songs[0]);
    });

    player.play(resource);
  } catch (err) {
    console.log("error, skip music!");
    songs.shift();
    audioPlayer(guild, songs[0]);
  }
};

module.exports = audioPlayer;
