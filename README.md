This bot gives a privilege to a user when an specific emoji (👍) reaction is made on a user's message.

The message should @notify or reply to an 'author'. This 'author' or a mod with the specified role can then give the reaction, awarding Lambda to the user.

That user can then spend Lambda by posting a Youtube video to the channel. If a user tries to post a video without having Lambda to spend, the message will be removed.

The bot only listens on specific channels, so make sure you set the `LISTENING_CHANNELS` environment variable

## Prerequisites

node.js v16.6+  
mariadb  
docker (Optional)

## Config

Create a file named `.env` in the root directory.

Fill it with the following, and edit the values accordingly:

```
MARIADB_HOST=db
MARIADB_PORT=3306
MARIADB_USER=root
MARIADB_PASSWORD=example
MARIADB_ROOT_PASSWORD=example
TOKEN=your-token-here

#The emoji you want to use to award Lambda
EMOJI=👍

#The channel(s) that the bot will moderate to separated by commas ex: 12342342,234234
LISTENING_CHANNELS=123456789101112,1234567890111214

#The channel that the bot will dump its messages to
BOT_CHANNEL=940430244542832670

#Only people with these roles (apart from the author) can give lambda. Comma-separated
MOD_ROLES=940434346060423198

#Test mode allows you to give lambda to yourself
TEST_MODE=false
```

## Setup

```
npm install
npm run watch
npm run nodemon
```

Or use the Dockerfile

```
sudo docker-compose build
sudo docker-compose up -d
```
