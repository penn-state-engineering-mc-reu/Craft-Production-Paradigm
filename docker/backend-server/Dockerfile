FROM node:10-slim

EXPOSE 3000

RUN useradd --create-home web-app-user

USER web-app-user

WORKDIR /home/web-app-user
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
COPY ./tsconfig.json ./tsconfig.json
RUN npm install
COPY ./src ./src
RUN npm run compile-nowatch

ENV DB_TYPE=mongo DB_HOST=db DB_AUTH_DB=local

CMD ["node", "./dist/server.js"]
