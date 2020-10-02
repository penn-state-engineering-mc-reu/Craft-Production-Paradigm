FROM node:10-slim

EXPOSE 3000

WORKDIR /root
COPY ./src ./src
COPY ./package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json
RUN npm install
RUN npm run compile-nowatch

ENV DB_TYPE=mongo DB_HOST=db DB_AUTH_DB=local

CMD node ./dist/server.js
