const { createAudioResource, demuxProbe } = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const { queue } = require("../util/queue");

const audioPlayer = async (guild, song) => {
  const { player, songs, connection, textChannel } = queue.get(guild.id);

  if (!song) {
    connection.destroy();
    queue.delete(guild.id);
    return;
  }
  const stream = await ytdl(song.url, {
    filter: "audio",
    quality: "highest",
  });

  if (!stream) return await textChannel.send({ content: `Deu pau aqui pae` });

  const resource = await probeAndCreateResource(stream);
  /*player.on("finish", () => {
    
  });*/

  player.play(resource);
  player.on("finish", () => {
    songs.shift();
    audioPlayer(guild, songs[0]);
  });
};

const probeAndCreateResource = async (readableStream) => {
  const { stream, type } = await demuxProbe(readableStream);
  return createAudioResource(stream, { inputType: type });
};

module.exports = audioPlayer;
