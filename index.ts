import * as config from './config.json'
import * as userConfig from './userConfig.json'
import * as Discord from 'discord.js'
import { initDB, upsert, query } from './mongodb'
const httpRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/

const token = config.token
const client = new Discord.Client()

initDB()

client.once('ready', () => {
    console.log('ready!');
})

client.login(token)



client.on('message', async (message) => {
    try {
        console.log(message.content)
        //Test to see if the message contains a link
        if (httpRegex.test(message.content)) {
            if (!await query(message.client.user?.id)) {
                message.delete({ reason: 'You must have previously given feedback that has been given a 👍 reaction in order to post links' })
            } else {
                message.reply('You have spent Lambda to post here. In order to post again, you must give feedback and recieve a 👍 reaction')
                upsert(message.client.user?.id, { 'canPost': false })

            }
        } else {
            const filter = (reaction: any, user: any) => {
                return ['👍'].includes(reaction.emoji.name)
                // && user.id !== message.author.id
            }

            message.awaitReactions(filter, { max: 1, time: userConfig.reactionTimeout, errors: ['time'] }).then(collected => {
                const reaction = collected.first();
                if (reaction?.emoji.name === '👍') {
                    message.reply(`Lambda has been awarded to you for your feedback!`)
                    upsert(reaction?.client.user?.id, { 'canPost': true })
                }
            })

        }
    } catch (err) {
        console.log('caught an error', err)
    }
})

