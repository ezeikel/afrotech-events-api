const express = require("express");
const cors = require('cors');
const morgan = require('morgan');
const cookierParser = require('cookie-parser');
const mongoose = require('mongoose');
const { ApolloServer } = require("apollo-server-express");
const { typeDefs, resolvers } = require('./schema');

// create express app
const app = express();

// enable cors
const allowedOrigins = [/(http:\/\/localhost:.*)/, /(https:\/\/afrotech-events-api-.*\.now\.sh$)/, 'https://afrotech.events', 'https://api.afrotech.events'];
const corsOptions = {
  optionsSuccessStatus: 200,
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || allowedOrigins.filter(allowedOrigin => allowedOrigin.test && allowedOrigin.test(origin)).length || origin === undefined) {
      callback(null, true);
    } else {
      callback(new Error(`${origin} is not allowed by CORS.`));
    }
  },
  credentials: true,
  // for older browsers that can't handle 204
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

// log all requests to the console
if (process.env.SILENCE_LOGS !== "true") {
  app.use(morgan("dev"));
}

app.use(cookierParser());

// ISSUE: https://github.com/apollographql/apollo-server/issues/1633
const { ObjectId } = mongoose.Types;
ObjectId.prototype.valueOf = function () {
  return this.toString();
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true, // enables introspection of the schema
  playground: true, // enables the actual playground
  context: req => ({ ...req })
});
// graphQL endpoint
server.applyMiddleware({ app, path: '/graphql', cors: false });

// export it so we can start the site in start.js
module.exports = app;



