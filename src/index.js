const {GraphQLServer} = require('graphql-yoga');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const {ApolloServer, gql} = require('apollo-server-express');
const fs = require('fs');

require('dotenv').config();
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '60mb', extended: true}));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  const {code} = req.query;
  let redirectUrl = `https://auth.expo.io/@leonzalion/timetract/`;
  if (code) redirectUrl += `?code=${code}`;
  res.redirect(redirectUrl);
});

app.listen(PORT, () => {console.log(`Listening on ${PORT}`)});

const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');
const User = require('./resolvers/User');
const Group = require('./resolvers/Group');

const resolvers = {
  Query,
  Mutation,
  User,
  Group
};

app.get('/', (req, res) => {
  res.redirect()
});

const server = new ApolloServer({
  typeDefs: gql(fs.readFileSync(__dirname.concat('/schema.graphql'), 'utf8')),
  resolvers,
  playground: true,
  context: request => {
    return {
      ...request,
      prisma,
    }
  },
});

server.applyMiddleware({app});

app.listen({port: 4000}, () => {
  console.log(`Server is running on https://timetract.herokuapp.com${server.graphqlPath}`);
});
