FROM node:18
WORKDIR /usr/src/nana

COPY package*.json ./
RUN npm install

COPY . .

ENV NANA_TOKEN=...
ENV MONGO=...

CMD [ "node", "index.js" ]