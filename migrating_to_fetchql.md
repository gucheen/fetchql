# Migrating to FetchQL

FetchQL is a lightweight GraphQL client that works in both browser and Node.js environments. This guide will help you migrate from other GraphQL clients to FetchQL, highlighting its unique features and providing examples of how to refactor your existing code.

## Why Choose FetchQL?

FetchQL offers several advantages:

- Lightweight and easy to use
- Built-in request interceptors
- Support for enum type queries with caching
- Request state callbacks
- Written in ES2015 with module support

## Installation

To get started with FetchQL, install it using npm:

```bash
npm install fetchql
```

## Basic Usage

Here's a basic example of how to use FetchQL:

```javascript
import FetchQL from 'fetchql';

const client = new FetchQL({
  url: 'https://your-graphql-server.com/graphql'
});

client.query({
  operationName: 'GetUser',
  query: `
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        name
        email
      }
    }
  `,
  variables: { id: '123' }
})
.then(({ data, errors }) => {
  if (errors) {
    console.error(errors);
  } else {
    console.log(data.user);
  }
});
```

## Migrating from Apollo Client

If you're migrating from Apollo Client, here are some key differences and how to adapt your code:

1. **Client Initialization**

   Apollo Client:
   ```javascript
   import { ApolloClient, InMemoryCache } from '@apollo/client';

   const client = new ApolloClient({
     uri: 'https://your-graphql-server.com/graphql',
     cache: new InMemoryCache()
   });
   ```

   FetchQL:
   ```javascript
   import FetchQL from 'fetchql';

   const client = new FetchQL({
     url: 'https://your-graphql-server.com/graphql'
   });
   ```

2. **Queries**

   Apollo Client:
   ```javascript
   client.query({
     query: gql`
       query GetUser($id: ID!) {
         user(id: $id) {
           id
           name
           email
         }
       }
     `,
     variables: { id: '123' }
   })
   .then(result => console.log(result.data.user));
   ```

   FetchQL:
   ```javascript
   client.query({
     operationName: 'GetUser',
     query: `
       query GetUser($id: ID!) {
         user(id: $id) {
           id
           name
           email
         }
       }
     `,
     variables: { id: '123' }
   })
   .then(({ data }) => console.log(data.user));
   ```

   Note: FetchQL requires an `operationName` to be specified.

3. **Mutations**

   Mutations in FetchQL are handled the same way as queries. Just change the query string to a mutation:

   ```javascript
   client.query({
     operationName: 'UpdateUser',
     query: `
       mutation UpdateUser($id: ID!, $name: String!) {
         updateUser(id: $id, name: $name) {
           id
           name
         }
       }
     `,
     variables: { id: '123', name: 'New Name' }
   })
   .then(({ data }) => console.log(data.updateUser));
   ```

## Unique Features of FetchQL

### 1. Interceptors

FetchQL allows you to add interceptors to modify requests or responses:

```javascript
const interceptor = {
  request: function (url, config) {
    // Modify the url or config here
    return [url, config];
  },
  response: function (response) {
    // Modify the response object
    return response;
  }
};

client.addInterceptors(interceptor);
```

### 2. Enum Type Queries

FetchQL provides a method to easily fetch enum types:

```javascript
client.getEnumTypes(['UserRole', 'PostStatus'])
  .then(({ data }) => {
    console.log(data.UserRole);
    console.log(data.PostStatus);
  });
```

### 3. Request State Callbacks

You can track the state of requests using callbacks:

```javascript
const client = new FetchQL({
  url: 'https://your-graphql-server.com/graphql',
  onStart: (queueLength) => console.log(`Request started. Queue length: ${queueLength}`),
  onEnd: (queueLength) => console.log(`Request ended. Queue length: ${queueLength}`)
});
```

### 4. Omitting Empty Variables

FetchQL can automatically remove null or empty string variables:

```javascript
const client = new FetchQL({
  url: 'https://your-graphql-server.com/graphql',
  omitEmptyVariables: true
});
```

## Conclusion

Migrating to FetchQL from other GraphQL clients is straightforward. Its lightweight nature and unique features like built-in interceptors and enum type caching make it a powerful choice for many applications. By following this guide, you should be able to quickly adapt your existing GraphQL code to work with FetchQL.