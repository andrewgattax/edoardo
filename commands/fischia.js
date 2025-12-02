const {Client, GatewayIntentBits, SlashCommandAssertions, SlashCommandBuilder, Interaction} = require('discord.js');
const {joinVoiceChannel, createAudioPlayer, createAudioResource} = require('@discordjs/voice');
const {createWriteStream} = require('fs');
const googleTTS = require('google-tts-api');
const prism = require('prism-media');
const {spawn} = require('child_process');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

module.exports = {
    name: "sisifo",
    description: "non ce la farai mai bastardo",
    async execute({client, interaction}) {

        try {

            const audioPath = "./assets/sys.mp3";

            let finalAudio

            const destroyedAudioPath = "./tempAudio/audio-destroyed.mp3";
            const distortionChain = "volume=30.0,highpass=f=800,asoftclip=type=hard:output=2";

            await new Promise((resolve, reject) => {
                ffmpeg(audioPath)
                    .audioFilters(distortionChain)
                    .output(destroyedAudioPath)
                    .on('end', () => {
                        console.log('Audio processing completato');
                        resolve();
                    })
                    .on('error', (err) => {
                        console.error('Errore durante l\'elaborazione audio:', err);
                        reject(err);
                    })
                    .run();
            });


            finalAudio = destroyedAudioPath;

            if (interaction.member.voice.channel) {
                const connection = joinVoiceChannel({
                    channelId: interaction.member.voice.channel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator
                });

                const player = createAudioPlayer();
                const resource = createAudioResource(finalAudio);
                player.play(resource);
                connection.subscribe(player);
                await interaction.reply("okay fratello");
            } else {
                interaction.reply("edoardo non sa in che cazzo di canale deve entrare coglione gay.");
            }
        } catch (error) {
            console.error(error);
            interaction.reply("Edoardo internal error");
        }
    }
}


