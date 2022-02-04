This bot gives a privilege to a user when the thumbsup (👍) reaction is made on a user's post.

After that, the user is allowed to post one link, and then the privilege is removed.

If the user does not have the privilege, the message that contains the link will be removed.

## Prerequisites

node.js v16.6+  
mariadb  
docker (Optional)  

## config

Create a file name `.env` in the root directory.

Fill it with the following, and edit the values accordingly:
 
MARIADB_HOST=db  
MARIADB_PORT=3306  
MARIADB_USER=root  
MARIADB_PASSWORD=example  
MARIADB_ROOT_PASSWORD=example  
TOKEN=your-token-here  

## Setup

npm install  
npm run watch  
npm run nodemon  

Or use the Dockerfile

docker build -t lambdabot:latest "."  
docker run lambdabot  

OR use docker-compose to launch the whole stack if you don't already have a mariadb set up.

docker-compose -f stack.yml up
