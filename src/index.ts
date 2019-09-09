require('dotenv').config();

import {RedditPostWatcher} from "./ExternalApi/Reddit";
import "reflect-metadata";
import {createConnection, In} from "typeorm";

import {Context} from "./Context";
import {executeCommand} from "./Execute";

import Discord = require('discord.js');
import {TextChannel} from "discord.js";


//Database
createConnection().then(() => {

//Client
    const client = new Discord.Client();
    Context.client = client;

    client.on('ready', async () => {
        //Set description
        await client.user.setPresence({status: "online", game: {name: `Use ${Context.prefix} help`}});

        const leaksRegex = /(informations?|raws?|leaks?)/i;

        //Start leaks watcher
        const redditWatcher = await RedditPostWatcher.create(process.env.LEAKS_REDDIT_USERNAME, (submission => {
            //Check subreddit
            if (submission.subreddit_name_prefixed.toLocaleLowerCase() !== process.env.LEAKS_REDDIT_SUB.toLocaleLowerCase()) {
                return false;
            }

            //Check words
            return leaksRegex.test(submission.title);

        }));

        const leaksChannel = <TextChannel>client.channels.find(channel => channel.id === process.env.LEAKS_CHANNEL_ID);

        redditWatcher.on("new", async submission => {
            await leaksChannel.send(`New leak from u/${process.env.LEAKS_REDDIT_USERNAME}\nhttps://www.reddit.com${submission.permalink}`);
        });

        console.log(`Bot is ready`);
    });

    client.on('message', async msg => {
        executeCommand(msg);
    });

    client.login(process.env.TOKEN);

//Keep awake
    if (process.env.HEROKU_KEEP_AWAKE.toLowerCase() == "true") {
        var http = require("http");
        setInterval(function () {
            http.get(process.env.HEROKU_URL);
        }, 300000);
    }

});