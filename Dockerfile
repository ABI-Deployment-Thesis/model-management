FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci
RUN np install -g nodemon

COPY . .

CMD ["nodemon", "index"]