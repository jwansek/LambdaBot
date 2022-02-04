FROM node:16

RUN mkdir -p /usr/src/lambda_bot
WORKDIR /usr/src/lambda_bot
COPY package*.json ./
RUN npm install && npm install typescript -g
COPY . .
RUN tsc -p ./src/tsconfig.json
CMD ["node","./dist/index.js"] 