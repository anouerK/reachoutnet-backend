FROM node:18.14.2-alpine3.17

ENV NODE_ENV=production NODE_PORT=3000

WORKDIR /app

COPY  package.json ./

RUN yarn install --production

COPY  . .

EXPOSE 3000

CMD [ "node", "app.js" ]
















