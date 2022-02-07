import * as dotenv from 'dotenv'
dotenv.config()
import { Client, Intents, Message, MessageReaction, ReactionEmoji, User } from 'discord.js'
import { init, dbCheckCanPost, upsert } from './mariadb'

init()
const listeningChannels = handleListeningChannels(process.env.LISTENING_CHANNELS)
const httpRegex = /((http:\/\/)?)(www\.)?((youtube\.com\/)|(youtu\.be)|(youtube)).+/

const token = process.env.TOKEN
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] })

client.once('ready', () => {
    console.log('lambda bot ready');
})

client.login(process.env.TOKEN)

client.on('messageCreate', handleMessage)

client.on('messageUpdate', async (oldMessage, newMessage) => {
    // if oldMessage contains a link, ignore it, the 'messageCreate' handler should have handled it already
    if (!oldMessage.partial && !httpRegex.test(oldMessage.content)) {
        handleMessage(newMessage as Message)
    }
})

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.content && !reaction.message.partial && !reaction.partial && !user.partial) {
        giveLambda(reaction, user)
    }
})

async function giveLambda(reaction: MessageReaction, user: User) {
    try {
        if (listeningChannels.includes(reaction.message.channelId)) {
            if (reaction?.emoji.name === '👍' && (user.id !== reaction.message.author?.id || process.env.TEST_MODE === 'true')) {
                // Check that the user doesn't already have lambda before 
                if (!await dbCheckCanPost(reaction.message.author?.id)) {
                    reaction.message.author?.send(`Lambda has been awarded to you for your feedback!`)
                    upsert(reaction?.message.author?.id, 1)
                }
            }
        }
    } catch (err) {
        console.log(err)
    }
}

async function handleMessage(message: Message) {
    try {
        if (listeningChannels.includes(message.channelId)) {
            //Test to see if the message contains a link
            if (httpRegex.test(message.content)) {
                // If you don't have lambda, then your message is deleted
                // else your lambda is removed but the message stays
                if (!await dbCheckCanPost(message.author?.id)) {

                    message.author.send('You must have previously given feedback that has been given a 👍 reaction in order to post links')
                    setTimeout(() => { message.delete() }, 1000)

                } else {
                    message.author.send('You have spent Lambda to post here. In order to post again, you must give feedback and recieve a 👍 reaction')
                    upsert(message.author?.id, 0)
                }
            }
        }
    } catch (err) {
        console.log('caught an error', err)
    }
}

function handleListeningChannels(channels: string | undefined) {
    if (!channels) {
        throw new Error('Bot not configured to run on any channels. Provide LISTENING_CHANNELS as an env var')
    }
    return channels.split(',')
}