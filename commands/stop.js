const { Client, GatewayIntentBits, SlashCommandAssertions, SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, getVoiceConnection } = require('@discordjs/voice');
const { createWriteStream } = require('fs');
const googleTTS = require('google-tts-api');
const prism = require('prism-media');
const { spawn } = require('child_process');
const axios = require('axios');
const intervalState = require('../intervalState');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

module.exports = {
    name: "stop",
    description: "edoardo se ne va",
    async execute ({client, interaction}) {
        if(intervalState.getIntervalId() != null) {
            intervalState.clearIntervalId();
        }

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            await interaction.reply('devi essere in un canale vocale gay');
            return;
        }

        const guildId = interaction.guild.id;
        const connection = getVoiceConnection(guildId); 

        if (!connection) {
            await interaction.reply('dimmi ti sembro in un canale vocale? ritardato di merda');
            return;
        }

        connection.destroy();
        await interaction.reply('addio figli di puttana');
    }
}


