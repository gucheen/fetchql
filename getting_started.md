# Getting Started with FetchQL

FetchQL is a lightweight GraphQL client that works in both browser and Node.js environments. This guide will help you get started with FetchQL, covering installation, basic usage, and how to make your first GraphQL query.

## Installation

You can install FetchQL using npm:

```bash
npm install fetchql
```

## Basic Usage

To use FetchQL in your project, first import it:

```javascript
import FetchQL from 'fetchql';
```

Or, if you're using CommonJS:

```javascript
const FetchQL = require('fetchql');
```

## Creating a FetchQL Instance

To create a new FetchQL instance, you need to provide the GraphQL server URL:

```javascript
const query = new FetchQL({
  url: 'https://your-graphql-server.com/graphql'
});
```

You can also pass additional options:

```javascript
const query = new FetchQL({
  url: 'https://your-graphql-server.com/graphql',
  headers: {
    'Authorization': 'Bearer your-token'
  },
  onStart: (requestQueueLength) => {
    console.log(`New request queue started. Queue length: ${requestQueueLength}`);
  },
  onEnd: (requestQueueLength) => {
    console.log(`Request queue finished. Queue length: ${requestQueueLength}`);
  },
  omitEmptyVariables: true
});
```

## Making Your First GraphQL Query

To make a GraphQL query using FetchQL, use the `query()` method:

```javascript
query.query({
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
  variables: {
    id: '123'
  }
})
.then(({ data, errors }) => {
  if (errors) {
    console.error('GraphQL errors:', errors);
  } else {
    console.log('User data:', data.user);
  }
})
.catch(error => {
  console.error('Network error:', error);
});
```

## Handling Enum Types

FetchQL provides a convenient way to fetch enum types from your GraphQL schema:

```javascript
query.getEnumTypes(['UserRole', 'PostStatus'])
  .then(({ data }) => {
    console.log('Enum types:', data);
  })
  .catch(error => {
    console.error('Error fetching enum types:', error);
  });
```

## Using Interceptors

FetchQL supports interceptors for request and response handling:

```javascript
const removeInterceptors = query.addInterceptors({
  request: (url, config) => {
    // Modify url or config here
    return [url, config];
  },
  response: (response) => {
    // Modify the response object
    return response;
  }
});

// Later, if you want to remove the interceptors:
removeInterceptors();
```

## Changing the GraphQL Server URL

You can change the GraphQL server URL at any time:

```javascript
query.setUrl('https://new-graphql-server.com/graphql');
```

## Conclusion

This guide covered the basics of using FetchQL in your project. For more advanced usage and a complete list of features, refer to the FetchQL documentation and API reference.