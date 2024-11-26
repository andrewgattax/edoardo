const { Client, GatewayIntentBits, SlashCommandAssertions, SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { createWriteStream } = require('fs');
const googleTTS = require('google-tts-api');
const prism = require('prism-media');
const { spawn } = require('child_process');
const axios = require('axios');
const intervalState = require('../intervalState');

module.exports = {
    name: "imprevedibile",
    description: "edoardo tira un porcone, ma quando non te lo aspetti",
    async execute ({client, interaction}) {

        let intervalTime = 3;

        if(intervalState.getIntervalId()) {
            interaction.reply("edoardo è già pronto a bestemmiare");
        } else {
            if(interaction.member.voice.channel) {
                const connection = joinVoiceChannel({
                    channelId: interaction.member.voice.channel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator
                });
            }
    
            const intervalId = setInterval( () => {
                bestemmia(client, interaction);
                intervalTime = Math.floor(Math.random() * 3) + 2;
            }, intervalTime * 60 * 1000); 
    
            intervalState.setIntervalId(intervalId);
            await interaction.reply("buongiorno figli di puttana");
        }     
    }
}

async function bestemmia (client, interaction) {
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
            const ffmpeg = spawn('ffmpeg', [
                '-i', audioPath,
                '-af', distortionChain,
                '-y',
                destroyedAudioPath,
            ]);

            ffmpeg.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`FFmpeg failed with code ${code}`));
            });
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
    } else {
        interaction.reply("edoardo non sa in che cazzo di canale deve entrare coglione.");
    }
    } catch (error) {
        console.error(error);
        interaction.reply("Edoardo internal error");
    }           
}
