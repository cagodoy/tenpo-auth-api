# Base container for compile service
FROM node:alpine

# Go to workdir
WORKDIR /auth-api

# Copy package.json file
COPY ./package.json ./

# Install dependencies in production mode
RUN yarn install

# Copy transpiled dist folder
COPY dist dist

# Copy proto folder
COPY ./proto ./proto

# Copy bin folder
COPY ./bin ./bin

# Copy goose migration tool
COPY bin/goose /usr/bin/goose

# Copy wait-db util
COPY bin/wait-db /usr/bin/wait-db

# Copy all database migrations
COPY ./src/database/migrations migrations

# Expose service port
EXPOSE 5010

# Run service
CMD ["/bin/sh", "-l", "-c", "wait-db && goose -dir /auth-api/migrations postgres ${POSTGRES_DSN} up && yarn start"]