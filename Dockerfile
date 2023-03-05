FROM node:18.14.2-alpine3.17

ENV NODE_ENV=production NODE_PORT=4001

WORKDIR /app

COPY  package.json ./

RUN yarn install --production

COPY  . .

CMD [ "yarn", "run", "deploy" ]
















