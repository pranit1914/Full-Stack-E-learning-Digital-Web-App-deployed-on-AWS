FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . ./
RUN mkdir -p uploads

EXPOSE 5000

CMD ["npm", "start"]