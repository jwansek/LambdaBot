This bot gives a privilege to a user when the thumbsup (👍) reaction is made on a user's message by someone other than the original author.  
After that, the user is allowed to post one link, and then the privilege is removed.  
If the user does not have the privilege, the message that contains the link will be removed.

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
LISTENING_CHANNELS=123456789101112,1234567890111214
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
docker build -t lambdabot:latest "."  
docker run lambdabot  
```

OR use docker-compose to launch the whole stack if you don't already have a mariadb set up.
```
docker-compose -f stack.yml up
```