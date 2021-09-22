const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const { Routes } = require("discord-api-types/v9");
const { REST } = require("@discordjs/rest");
const anticrash = require("./anticrash");

require("dotenv/config");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});
const commands = [];
client.commands = new Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
}

client.once("ready", (c) => {
  console.log("Ready!");

  const clientId = client.user.id;
  const rest = new REST({
    version: "9",
  }).setToken(process.env.TOKEN);
  (async () => {
    try {
      await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      });
      console.log("Commands registered in application");
    } catch (error) {
      if (error) console.error(error);
    }
  })();
});

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
