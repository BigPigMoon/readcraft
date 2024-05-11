FROM node:20 AS builder

WORKDIR /app

RUN npm install -g npm@10.7.0

COPY package*.json ./
COPY prisma ./prisma/

RUN npm i

COPY . .

RUN npm run build
RUN npx prisma generate

FROM node:20

COPY --from=builder /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/npm
COPY --from=builder /usr/local/bin/npm /usr/local/bin/npm
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/tsconfig*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD [ "npm", "run", "start:prisma:prod"]