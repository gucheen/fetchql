import express from 'express';
import { apolloServer } from 'apollo-server';
import Schema from './schema';
import Mocks from './mocks';

const GRAPHQL_PORT = 4321;

const graphQLServer = express();
graphQLServer.use('/graphql', apolloServer((req) => {
  let headerCheck = req.headers['test-header'] === 'test-header';

  return {
    graphiql: true,
    pretty: true,
    schema: Schema,
    mocks: Mocks(headerCheck)
  };
}));
graphQLServer.listen(GRAPHQL_PORT, () => console.log(
  `GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}/graphql`
));
