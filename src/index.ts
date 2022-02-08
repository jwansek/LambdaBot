import * as dotenv from 'dotenv'
dotenv.config()
import { Client, Intents, Message, MessageReaction, ReactionEmoji, TextChannel, User } from 'discord.js'
import { init, dbCheckCanPost, upsert } from './mariadb'

init()
const listeningChannels = handleListeningChannels(process.env.LISTENING_CHANNELS)
const modRoles = handleModRoles(process.env.MOD_ROLES)
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

client.on('error', (err => {
    console.log(err)
}))

client.on('shardError', (err => {
    console.log(err)
}))

async function giveLambda(reaction: MessageReaction, user: User) {
    try {
        if (!reaction.message.partial) {
            if (listeningChannels.includes(reaction.message.channelId)) {
                if (reaction?.emoji.name === process.env.EMOJI && (user.id !== reaction.message.author?.id || process.env.TEST_MODE === 'true')) {
                    if (checkIfCanGiveLambda(reaction.message, user)) {
                        // Check that the user doesn't already have lambda before 
                        if (!await dbCheckCanPost(reaction.message.author?.id)) {
                            (reaction.client.channels.cache.get(process.env.BOT_CHANNEL as string) as TextChannel)
                                .send(`<@${user.id}> Lambda has been awarded to you for your feedback!`)
                            upsert(reaction?.message.author?.id, 1)
                            console.log(`${user.username} gave Lambda to ${reaction.message.author.username}`)
                        } else {
                            console.log(`${user.username} tried to give Lambda to ${reaction.message.author.username}, but this user already has Lambda`)
                        }
                    } else {
                        console.log(`${user.username} is not authorized to give lambda to ${reaction.message.author.username}`)
                    }
                } else {
                    console.log(`${user.username} tried to give Lambda to themselves, but that's not allowed unless TEST_MODE is on`)
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
            // Test to see if the message contains a link
            if (httpRegex.test(message.content)) {
                // If you don't have lambda, then your message is deleted
                // else your lambda is removed but the message stays
                if (!await dbCheckCanPost(message.author?.id)) {
                    const channel = message.client.channels.cache.get(process.env.BOT_CHANNEL as string) as TextChannel
                    channel.send(`Hi <@${message.author.id}>, your video posted in ${channel.name} was deleted because you failed to meet the Lambda requirements. Kindly give someone constructive feedback to earn it!`)
                    setTimeout(() => { message.delete() }, 1000)
                    console.log(`${message.author.username}'s post was removed because they did not have any Lambda`)
                } else {
                    const channel = message.client.channels.cache.get(process.env.BOT_CHANNEL as string) as TextChannel
                    channel.send(`Hi <@${message.author.id}>, you have spent Lambda to post a Youtube link here. In order to post again, you must get Lambda by giving feedback and receiving a ${process.env.EMOJI} reaction`)
                    upsert(message.author?.id, 0)
                    console.log(`${message.author.username} spent lambda`)
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

function handleModRoles(modRoles: string | undefined) {
    if (!modRoles) {
        throw new Error('Bot not configured with any mod roles. Provide MOD_ROLES as an env var')
    }
    return modRoles.split(',')
}

// The mods in the role: MOD_ROLE and the user(s) mentioned in the message that is being reacted to can give lambda
function checkIfCanGiveLambda(message: Message, reactingUser: User) {

    let approvedMembers: string[] = []
    approvedMembers.push(message.author.id)

    for (const role of modRoles) {
        const resolvedRole = message.guild?.roles.cache.get(role)
        resolvedRole?.members.forEach(member => {
            approvedMembers.push(member.id)
        })
    }

    if (message.mentions) {
        message.mentions.users.forEach(user => {
            approvedMembers.push(user.id)
        })
        if (message.mentions.repliedUser?.id) {
            approvedMembers.push(message.mentions.repliedUser?.id)
        }
    }

    if (approvedMembers.includes(reactingUser.id)) {
        return true
    } else {
        return false
    }
}

process.on('unhandledRejection', error => {
    console.log(error)
})