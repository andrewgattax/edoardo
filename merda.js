const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const axios = require('axios');
const googleTTS = require('google-tts-api');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages] });

client.on('messageCreate', async (message) => {
    if (message.content === '!parla') {
        try {
            // Step 1: Fai una richiesta HTTP
            const response = await axios.get('https://esempio.com/api/testo');
            const testo = response.data; // Supponendo che la stringa sia nel corpo della risposta

            // Step 2: Genera un URL TTS
            const audioURL = googleTTS.getAudioUrl(testo, {
                lang: 'it',
                slow: false,
                host: 'https://translate.google.com',
            });

            // Step 3: Collega il bot al canale vocale
            if (message.member.voice.channel) {
                const connection = joinVoiceChannel({
                    channelId: message.member.voice.channel.id,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator,
                });

                // Step 4: Riproduci l'audio
                const player = createAudioPlayer();
                const resource = createAudioResource(audioURL);
                player.play(resource);
                connection.subscribe(player);

                // Disconnetti dopo la riproduzione
                player.on('idle', () => connection.destroy());
            } else {
                message.reply('Devi essere in un canale vocale per usare questo comando!');
            }
        } catch (error) {
            console.error(error);
            message.reply('C\'è stato un errore durante l\'esecuzione del comando.');
        }
    }
});

client.login('YOUR_BOT_TOKEN');
