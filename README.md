# Tournament Server

Project uses [FluidFramework](https://github.com/microsoft/FluidFramework)

## Setup

Get the current codebase

Install `MongoDB` and `Redis` if you havent already

Start Mongo server

    mongod -port=27018

Start Redis server

    redis-server --port 6380 --loglevel verbose

## Starting the server

    npm run start
