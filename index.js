const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const { Routes } = require("discord-api-types/v9");
const { REST } = require("@discordjs/rest");
const manager = require("./util/manager");
const anticrash = require("./anticrash");

require("dotenv/config");
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

const commands = () => {
  //const array = [];
  client.commands = new Collection();
  const commandFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.data.name, command);
  }
};

client.manager = manager(client);

client.once("ready", async (c) => {
  console.log("Ready!");
  commands();
  const clientId = client.user.id;
  await client.manager.init(clientId);
  console.log("Commands registered in application");
});

client.on("raw", (d) => client.manager.updateVoiceState(d));

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.log(error);
    await interaction.reply({
      content: "Erro ao executar o comando!",
      ephemeral: true,
    });
  }
});
anticrash(client);
client.login(process.env.TOKEN);
