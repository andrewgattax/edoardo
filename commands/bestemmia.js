const { Client, GatewayIntentBits, SlashCommandAssertions, SlashCommandBuilder, Interaction } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { createWriteStream } = require('fs');
const googleTTS = require('google-tts-api');
const prism = require('prism-media');
const { spawn } = require('child_process');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');



module.exports = {
    name: "bestemmia",
    description: "edoardo tira un porcone assurdo",
    async execute ({client, interaction}) {

        try {
            const response = await axios.get("http://json.mannaggiacri.store:8621");
        const text = response.data.bestemmion;

        const audioURL = googleTTS.getAudioUrl(text, {
            lang: "es",
            slow: false,
            host: "https://translate.google.com"
        });

        const audioPath = "./tempAudio/audio-original.mp3";
        const writer = createWriteStream(audioPath);
        const audioResponse = await axios({
            url: audioURL,
            method: "GET",
            responseType: "stream"
        });
        audioResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const destroyedAudioPath = "./tempAudio/audio-destroyed.mp3";
        const domenicoPath = "./assets/le_voci_di_domenico.mp3";

        let isDomenico = Math.random()<=0.1;
        console.log(isDomenico);
        let distortionChain = "volume=30.0,highpass=f=800,asoftclip=type=hard:output=2";

        let finalAudio
        if(isDomenico) {
            finalAudio = domenicoPath;
        } else {
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
        }

        if(interaction.member.voice.channel) {
            const connection = joinVoiceChannel({
                channelId: interaction.member.voice.channel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator
            });

            const player = createAudioPlayer();
            const resource = createAudioResource(finalAudio);
            player.play(resource);
            connection.subscribe(player);
            
            // Reply di successo
            await interaction.reply("okay fratello");
        } else {
            // Reply se non è in un canale vocale
            await interaction.reply("edoardo non sa in che cazzo di canale deve entrare coglione.");
        }
        } catch (error) {
            console.error(error);
            
            // Controlla se l'interaction è già stata acknowledged
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply("Edoardo internal error");
            } else {
                // Se è già stata replied, usa followUp
                await interaction.followUp("Edoardo internal error");
            }
        }       
    }
}


