FROM node:24

WORKDIR /app

COPY . .

RUN npm i -g pnpm && pnpm i

EXPOSE 3000

WORKDIR /app/apps/api

RUN pnpm run build

CMD [ "pnpm", "start:prod" ]
