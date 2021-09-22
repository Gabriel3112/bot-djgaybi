const queueConstructor = {
  voiceChannel: null,
  textChannel: null,
  connection: null,
  player: null,
  songs: [],
};

const queue = new Map();

module.exports = { queue, queueConstructor };
