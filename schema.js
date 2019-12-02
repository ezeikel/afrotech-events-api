const { gql } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const mongoose = require('mongoose');
const Event = mongoose.model('Event');

// defining "shape" of data
module.exports.typeDefs = gql`
  scalar Date

  type Query {
    events: [Event]!
    event(id: ID!): Event
  }

  type Event {
    id: ID!
    name: String!
    host: String!
    date: Date!
    duration: Int!
    address: String!
    rsvpLink: String
    notes: String
  }

  type Mutation {
    createEvent(
      name: String!
      host: String!
      startTime: Date!
      endTime: Date!
      address: String!
      rsvpLink: String
      notes: String
    ): Event!
  }
`;

// this is how we "get" the data we need
module.exports.resolvers = {
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    parseValue(value) {
      console.log('parseValue()');
      return new Date(value); // value from the client
    },
    serialize(value) {
      console.log('serialize()');
      return value.getTime(); // value sent to client
    },
    parseLiteral(ast) {
      console.log('parseLiteral()');
      if (ast.kind === Kind.INT) {
        return new Date(ast.value); // ast value is always in string format
      }
      // FIX: added this to fix null being returned when date is already a string
      // "1572903000000" or "2019-11-04:21:30:00" work from client but not 1572903000000
      // 1572903000000 works when value not passed literally but as a variable calling parseValue instead
      // https://github.com/graphql/graphql-js/issues/500#issuecomment-248992816
      else if (ast.kind === Kind.STRING) {
        return ast.value
      }

      return null;
    },
  }),
  Query: {
    event: (_, { id }, context) => Event.findOne({ _id: id }),
    events: () => Event.find()
  },
  Mutation: {
    createEvent: async (_, { name, host, startTime, endTime, address, resvpLink, notes }, context) => {
      const duration = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000;

      const event = await Event({
        name,
        host,
        date: startTime,
        duration,
        address,
        resvpLink,
        notes
      }).save();

      return event;
    },
  }
}