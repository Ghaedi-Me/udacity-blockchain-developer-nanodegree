# RESTful Web API with Node.js Framework

This project has RESTful APIs built using Express Node.js framework that interfaces with the private blockchain built in [Project 2](https://github.com/kartikeybhardwaj/udacity-blockchain-developer-nanodegree/tree/master/Project%202%20-%20Blockchain%20Data).
This project has two endpoints:
* GET block
* POST block

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

This uses [ExpressJS](https://expressjs.com) which will be installed when running `npm install`. See configuration section below.

### Configuring your project

- Install requirements

```
npm install 
```

- Run server

```
node app.js
```

This will run the server on `http://localhost:8000` .

### Endpoints

#### Get Block Endpoint

To get get block at _nth_ height 
```
curl "http://localhost:8000/block/n"
```

#### Post Block Endpoint

```
curl --header "Content-Type: application/json" --request POST --data "{\"body\":\"Testing block with test string data\"}" http://localhost:8000/block
```