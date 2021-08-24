FROM node:14.16.0-alpine3.10

RUN mkdir -p /usr/src/app && chown -R node:node /usr/src/app

WORKDIR /usr/src/app

COPY ./ /usr/src/app

RUN npm install

EXPOSE 80 3000

CMD ["npm", "start"]