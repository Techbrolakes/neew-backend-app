FROM node:14-alpine 

WORKDIR /source/app

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "build/app.js" ]

