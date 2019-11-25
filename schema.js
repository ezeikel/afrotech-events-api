const { gql } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const mongoose = require('mongoose');

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
    time: Date!
    address: String!
    rsvpLink: String
    notes: String
  }

  type Mutation {
    createEvent(
      name: String!
      host: String!
      date: Date!
      time: Date!
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
      return new Date(value); // value from the client
    },
    serialize(value) {
      return value.getTime(); // value sent to client
    },
    parseLiteral(ast) {
      if (ast.kind === kind.INT) {
        return new Date(ast.value); // ast value is always in string format
      }
      return null;
    },
  }),
  Query: {
    event: (_, { id }, context) => Event.findOne({ _id: id }),
    events: () => Event.find()
  },
  Mutation: {
    createEvent: async (_, { name, host, date, time, address, rsvpLink, notes }, context) => {
      const event = await Event({
        name,
        host,
        date,
        time,
        address,
        rsvpLink,
        notes
      }).save();

      return event;
    },
  }
}