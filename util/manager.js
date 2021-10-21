const { Manager } = require("erela.js");
require("dotenv/config");
module.exports = (client) => {
  return new Manager({
    nodes: [
      {
        host: process.env.HOST,
        password: process.env.PASSWORD,
        port: 2333,
      },
    ],
    send: (id, payload) => {
      const guild = client.guilds.cache.get(id);
      if (guild) guild.shard.send(payload);
    },
  })
    .on("nodeConnect", (node) =>
      console.log(
        `(Lavalink) - Connection established with server. ip: "${node.options.identifier}"`
      )
    )
    .on("nodeError", (node, error) =>
      console.log(
        `(Lavalink) - Connection failed. "${node.options.identifier}" encountered an error: ${error.message}.`
      )
    )
    .on("queueEnd", (player) => {
      const channel = client.channels.cache.get(player.textChannel);

      channel.send("Acabou a fila filhão.");

      player.destroy();
    });
};
