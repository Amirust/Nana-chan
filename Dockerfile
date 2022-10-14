FROM node:18
WORKDIR /usr/src/nana

COPY package*.json ./
RUN npm install

COPY . .

ARG NANA_TOKEN
ENV NANA_TOKEN=$NANA_TOKEN

ARG MONGO
ENV MONGO=$MONGO

CMD [ "node", "index.js" ]