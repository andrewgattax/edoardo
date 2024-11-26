require("dotenv").config();

const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');

const fs = require("node:fs");
const path = require("node:path");

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages]
})

const commands = [];
client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    client.commands.set(command.name, command);
    commands.push(command);
}

client.on("ready", () => {
    const guild_ids = client.guilds.cache.map(guild => guild.id);

    const rest = new REST({version: "10"}).setToken(process.env.TOKEN);
/*     console.log(guild_ids); */
    for (const guildId of guild_ids) {
        console.log(guildId);
        rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), {
            body: commands
        })
        .then(() => console.log("Added commands to " + guildId))
        .catch(console.error);
    }
})

client.on("interactionCreate", async interaction => {
    if(!interaction.isCommand) return;

    const command = client.commands.get(interaction.commandName);
    if(!command) return;

    try {
        await command.execute({client, interaction});
    }
    catch(err) {
        console.error(err);
        await interaction.reply("edoardo non è d'accordo (corri)");
    }
})

client.on("guildCreate", async () => {
    rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, client.guild.id), {
        body: commands
    })
    .then(() => console.log("Added commands to " + guildId))
    .catch(console.error);
})
//implementa aggiunta comandi su nuova guild

client.login(process.env.TOKEN);